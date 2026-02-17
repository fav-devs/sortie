//! Sortie organizer commands: load videos, load/save swipe config.

use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

use crate::types::{OrganizerConfig, VideoClip};

const VIDEO_EXTENSIONS: &[&str] = &["mp4", "mov"];
const ORGANIZER_CONFIG_FILENAME: &str = "organizer_config.json";

/// Path prefixes we must not allow for user-selected source directories.
#[cfg(unix)]
const BLOCKED_PATH_PREFIXES: &[&str] = &["/usr", "/etc", "/bin", "/sbin", "/lib", "/System"];
#[cfg(windows)]
const BLOCKED_PATH_PREFIXES: &[&str] = &[
    "C:\\Windows",
    "C:\\Program Files",
    "C:\\Program Files (x86)",
];

fn is_blocked_directory(path: &Path) -> bool {
    let path_str = path.to_string_lossy();
    BLOCKED_PATH_PREFIXES
        .iter()
        .any(|prefix| path_str.starts_with(prefix))
}

fn get_organizer_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {e}"))?;
    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {e}"))?;
    Ok(app_data_dir.join(ORGANIZER_CONFIG_FILENAME))
}

fn has_video_extension(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| {
            let ext_lower = e.to_lowercase();
            VIDEO_EXTENSIONS.contains(&ext_lower.as_str())
        })
        .unwrap_or(false)
}

/// Load video files (mp4, mov) from a directory. Path must not be a system directory.
#[tauri::command]
#[specta::specta]
pub fn load_videos(path: String) -> Result<Vec<VideoClip>, String> {
    let path_buf = PathBuf::from(&path);
    if !path_buf.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    if is_blocked_directory(&path_buf) {
        return Err("Access to system directories is not allowed".to_string());
    }

    let mut clips = Vec::new();
    let entries =
        std::fs::read_dir(&path_buf).map_err(|e| format!("Failed to read directory: {e}"))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {e}"))?;
        let p = entry.path();
        if !p.is_file() || !has_video_extension(&p) {
            continue;
        }
        let size = std::fs::metadata(&p)
            .map(|m| m.len().min(u64::from(u32::MAX)) as u32)
            .unwrap_or(0);
        let filename = p
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();
        let format = p
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();
        let path_str = p.to_string_lossy().into_owned();
        clips.push(VideoClip {
            id: path_str.clone(),
            path: path_str,
            filename,
            size,
            duration_secs: 0.0,
            format,
        });
    }

    clips.sort_by(|a, b| a.filename.cmp(&b.filename));
    log::info!("Loaded {} video clips from {}", clips.len(), path);
    Ok(clips)
}

/// Load organizer config from app data. Returns defaults if file does not exist.
#[tauri::command]
#[specta::specta]
pub async fn load_organizer_config(app: AppHandle) -> Result<OrganizerConfig, String> {
    let config_path = get_organizer_config_path(&app)?;
    if !config_path.exists() {
        log::info!("Organizer config not found, using defaults");
        return Ok(OrganizerConfig::default());
    }
    let contents = std::fs::read_to_string(&config_path).map_err(|e| {
        log::error!("Failed to read organizer config: {e}");
        format!("Failed to read config: {e}")
    })?;
    let config: OrganizerConfig = serde_json::from_str(&contents).map_err(|e| {
        log::error!("Failed to parse organizer config: {e}");
        format!("Failed to parse config: {e}")
    })?;
    log::info!("Loaded organizer config");
    Ok(config)
}

/// Save organizer config to app data. Uses atomic write (temp + rename).
#[tauri::command]
#[specta::specta]
pub async fn save_organizer_config(app: AppHandle, config: OrganizerConfig) -> Result<(), String> {
    let config_path = get_organizer_config_path(&app)?;
    let json_content = serde_json::to_string_pretty(&config).map_err(|e| {
        log::error!("Failed to serialize organizer config: {e}");
        format!("Failed to serialize config: {e}")
    })?;
    let temp_path = config_path.with_extension("tmp");
    std::fs::write(&temp_path, json_content).map_err(|e| {
        log::error!("Failed to write organizer config: {e}");
        format!("Failed to write config: {e}")
    })?;
    if let Err(e) = std::fs::rename(&temp_path, &config_path) {
        log::error!("Failed to finalize organizer config: {e}");
        let _ = std::fs::remove_file(&temp_path);
        return Err(format!("Failed to save config: {e}"));
    }
    log::info!("Saved organizer config to {:?}", config_path);
    Ok(())
}

/// Process a clip based on swipe action: move to subfolder or trash.
/// Returns the new absolute path of the file.
#[tauri::command]
#[specta::specta]
pub async fn process_clip(clip: VideoClip, action: crate::types::SwipeAction) -> Result<String, String> {
    let source_path = PathBuf::from(&clip.path);
    if !source_path.exists() {
        return Err("Source file not found".to_string());
    }

    let parent_dir = source_path
        .parent()
        .ok_or_else(|| "Cannot determine parent directory".to_string())?;

    let target_dir = match action {
        crate::types::SwipeAction::Move { target } => {
            let p = PathBuf::from(&target);
            if p.is_absolute() {
                p
            } else {
                parent_dir.join(p)
            }
        }
        crate::types::SwipeAction::Delete => parent_dir.join("_Trash"),
        crate::types::SwipeAction::Skip => return Ok(clip.path),
    };

    if !target_dir.exists() {
        std::fs::create_dir_all(&target_dir)
            .map_err(|e| format!("Failed to create target directory: {e}"))?;
    }

    let file_name = source_path
        .file_name()
        .ok_or_else(|| "Invalid filename".to_string())?;
    let target_path = target_dir.join(file_name);

    if target_path.exists() {
        return Err(format!(
            "Target file already exists: {}",
            target_path.to_string_lossy()
        ));
    }

    std::fs::rename(&source_path, &target_path)
        .map_err(|e| format!("Failed to move file: {e}"))?;

    log::info!(
        "Moved {} to {}",
        source_path.display(),
        target_path.display()
    );
    Ok(target_path.to_string_lossy().to_string())
}

/// Undo the last action: move file back to original location.
#[tauri::command]
#[specta::specta]
pub async fn undo_action(current_path: String, original_path: String) -> Result<(), String> {
    let current = PathBuf::from(&current_path);
    let original = PathBuf::from(&original_path);

    if !current.exists() {
        return Err(format!("File not found at current path: {}", current.display()));
    }

    if let Some(parent) = original.parent() {
        if !parent.exists() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to recreate original directory: {e}"))?;
        }
    }

    if original.exists() {
        return Err(format!(
            "File already exists at original path: {}",
            original.display()
        ));
    }

    std::fs::rename(&current, &original).map_err(|e| format!("Failed to move file back: {e}"))?;

    log::info!("Restored {} to {}", current.display(), original.display());
    Ok(())
}

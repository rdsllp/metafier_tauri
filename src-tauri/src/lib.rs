use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use tokio::process::Command;

// Application state
#[derive(Default)]
pub struct AppState {
    pub loaded_file: Mutex<String>,
    pub default_path: Mutex<String>,
    pub metafier_path: Mutex<Option<String>>,
}

// Response structures
#[derive(Serialize)]
pub struct FileDialogResult {
    file_name: String,
    file_path: String,
}

#[derive(Serialize)]
pub struct TrimListResponse {
    xml_data: HashMap<String, String>,
    trim_list: TrimList,
}

#[derive(Serialize)]
pub struct TrimList {
    #[serde(rename = "L2")]
    l2: Vec<String>,
    #[serde(rename = "L8")]
    l8: Vec<String>,
}

#[derive(Serialize)]
pub struct CommandResult {
    success: bool,
    msg: String,
}

// Configuration structure
#[derive(Serialize, Deserialize)]
struct Config {
    metafier_path: String,
}

// Get default metafier path based on OS
fn get_default_metafier_path() -> String {
    if cfg!(target_os = "windows") {
        "C:\\Program Files\\Dolby\\Dolby_Vision_Professional_Tools_v5.5.0\\metafier.exe".to_string()
    } else {
        "/usr/local/bin/dolby_vision_professional_tools/metafier".to_string()
    }
}

// Load metafier path by OS (Windows-specific logic)
fn load_metafier_path_by_os() -> String {
    if cfg!(target_os = "windows") {
        let program_files_path = "C:\\Program Files\\Dolby\\";
        if let Ok(entries) = std::fs::read_dir(program_files_path) {
            for entry in entries.flatten() {
                let file_name = entry.file_name();
                let name = file_name.to_string_lossy().to_lowercase();
                if name.contains("dolby_vision_professional_tools") {
                    return format!(
                        "{}{}\\metafier.exe",
                        program_files_path,
                        file_name.to_string_lossy()
                    );
                }
            }
        }
        get_default_metafier_path()
    } else {
        "/usr/local/bin/dolby_vision_professional_tools/metafier".to_string()
    }
}

// Get config file path
fn get_config_path() -> Result<PathBuf, String> {
    if let Some(data_dir) = dirs::data_dir() {
        Ok(data_dir.join("dolby_metafier").join("config.json"))
    } else {
        Err("Could not determine data directory".to_string())
    }
}

// Load metafier path from config or detect default
fn load_metafier_path() -> Result<String, String> {
    let config_path = get_config_path()?;

    if config_path.exists() {
        let config_content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;

        let config: Config = serde_json::from_str(&config_content)
            .map_err(|e| format!("Failed to parse config: {}", e))?;

        Ok(config.metafier_path)
    } else {
        Ok(load_metafier_path_by_os())
    }
}

// Save metafier path to config
fn save_metafier_path(file_path: &str) -> Result<(), String> {
    let config_path = get_config_path()?;

    // Create directory if it doesn't exist
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    let config = Config {
        metafier_path: file_path.to_string(),
    };

    let config_json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    std::fs::write(&config_path, config_json)
        .map_err(|e| format!("Failed to write config: {}", e))?;

    Ok(())
}

// Run metafier command
async fn run_command(args: Vec<String>) -> CommandResult {
    let metafier_path = match load_metafier_path() {
        Ok(path) => path,
        Err(e) => {
            return CommandResult {
                success: false,
                msg: e,
            }
        }
    };

    let mut cmd = Command::new(&metafier_path);
    cmd.args(&args);

    match cmd.output().await {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);
            let combined_output = format!("{}{}", stdout, stderr);

            if output.status.success() {
                CommandResult {
                    success: true,
                    msg: combined_output,
                }
            } else {
                CommandResult {
                    success: false,
                    msg: combined_output,
                }
            }
        }
        Err(e) => CommandResult {
            success: false,
            msg: format!("Failed to execute command: {}", e),
        },
    }
}

// Analyze logs to extract metadata (port from Electron)
fn analyze_logs(output: &str) -> TrimListResponse {
    let mut xml_data = HashMap::new();
    let mut l2_trim = Vec::new();
    let mut l8_trim = Vec::new();

    for line in output.lines() {
        // L2 Trim Count
        if line.contains("L2 Trim Count") {
            let re = Regex::new(r"\((\d+),").unwrap();
            l2_trim = re
                .find_iter(line)
                .filter_map(|m| {
                    let full_match = m.as_str();
                    let num_re = Regex::new(r"\d+").unwrap();
                    num_re.find(full_match).map(|n| n.as_str().to_string())
                })
                .collect();
        }

        // L8 Trim Count
        if line.contains("L8 Trim Count") {
            let re = Regex::new(r"\((\d+),").unwrap();
            l8_trim = re
                .find_iter(line)
                .filter_map(|m| {
                    let full_match = m.as_str();
                    let num_re = Regex::new(r"\d+").unwrap();
                    num_re.find(full_match).map(|n| n.as_str().to_string())
                })
                .collect();
        }

        // Metadata version
        if line.contains("Metadata version:") {
            if let Some(re) = Regex::new(r"(\d+\.\d+\.\d+)").unwrap().find(line) {
                xml_data.insert("XML Version".to_string(), re.as_str().to_string());
            }
        }

        // Level254 CMVersion
        if line.contains("Level254 CMVersion:") {
            let version = line.replace("Level254 CMVersion:", "").trim().to_string();
            xml_data.insert("Level 254 CM Version".to_string(), version);
        }

        // Aspect Ratios
        if line.contains("Aspect Ratios (Canvas - Image):") {
            if let Some(captures) = Regex::new(r".*?(\d+(?:\.\d+)?) - (\d+(?:\.\d+)?)")
                .unwrap()
                .captures(line)
            {
                if let (Some(canvas), Some(image)) = (captures.get(1), captures.get(2)) {
                    xml_data.insert(
                        "Global Aspect Ratio (Canvas)".to_string(),
                        canvas.as_str().to_string(),
                    );
                    let image_val: f64 = image.as_str().parse().unwrap_or(0.0);
                    let rounded = (image_val * 100.0).floor() / 100.0;
                    xml_data.insert(
                        "Global Aspect Ratio (Image)".to_string(),
                        format!("{:.2}", rounded),
                    );
                }
            }
        }

        // Frame Rate
        if line.contains("Frame Rate:") {
            if let Some(captures) = Regex::new(r"(\d+(?:\.\d+)?)fps").unwrap().captures(line) {
                if let Some(fps) = captures.get(1) {
                    let fps_val: f64 = fps.as_str().parse().unwrap_or(0.0);
                    xml_data.insert("Frame Rate".to_string(), format!("{:.2}", fps_val));
                }
            }
        }

        // Mastering Monitor
        if line.contains("Mastering Monitor:") {
            if let Some(captures) = Regex::new(r"\(ID\s*(\d+)\)").unwrap().captures(line) {
                if let Some(id) = captures.get(1) {
                    xml_data.insert("Mastering Monitor".to_string(), id.as_str().to_string());
                }
            }
        }

        // Level6 MaxFALL and MaxCLL
        if line.contains("Level6 (MaxFALL - MaxCLL):") {
            if let Some(captures) = Regex::new(r"(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)")
                .unwrap()
                .captures(line)
            {
                if let (Some(fall), Some(cll)) = (captures.get(1), captures.get(2)) {
                    xml_data.insert("Level 6 MaxFALL".to_string(), fall.as_str().to_string());
                    xml_data.insert("Level 6 MaxCLL".to_string(), cll.as_str().to_string());
                }
            }
        }

        // Color Encoding
        if line.contains("Color Encoding:") {
            if let Some(captures) =
                Regex::new(r"(pq\(\d+(?:\.\d+)?,\d+(?:\.\d+)?\))\s(\w+)\s(\w+)\s(\w+)")
                    .unwrap()
                    .captures(line)
            {
                if let (Some(_pq), Some(color_space), Some(signal_range), Some(color_primaries)) = (
                    captures.get(1),
                    captures.get(2),
                    captures.get(3),
                    captures.get(4),
                ) {
                    xml_data.insert(
                        "Color Primaries".to_string(),
                        color_primaries.as_str().to_string(),
                    );
                    xml_data.insert("White Point".to_string(), "D65".to_string());
                    xml_data.insert("Color Space".to_string(), color_space.as_str().to_string());
                    xml_data.insert("EOTF".to_string(), "pq".to_string());
                    xml_data.insert(
                        "Signal Range".to_string(),
                        signal_range.as_str().to_string(),
                    );
                }
            }
        }
    }

    TrimListResponse {
        xml_data,
        trim_list: TrimList {
            l2: l2_trim,
            l8: l8_trim,
        },
    }
}

// Tauri Commands
#[tauri::command]
async fn validate_xml(mode: u8, state: State<'_, AppState>) -> Result<String, String> {
    let loaded_file = state.loaded_file.lock().unwrap().clone();
    if loaded_file.is_empty() {
        return Err("No file loaded".to_string());
    }

    let args = match mode {
        0 => vec!["--validate".to_string(), loaded_file],
        1 => vec!["--validate".to_string(), loaded_file],
        2 => vec![
            "--validate".to_string(),
            "--with-lift".to_string(),
            loaded_file,
        ],
        _ => return Err("Invalid validation mode".to_string()),
    };

    let result = run_command(args).await;
    Ok(result.msg)
}

#[tauri::command]
async fn get_trim_list(
    file_path: String,
    state: State<'_, AppState>,
) -> Result<TrimListResponse, String> {
    // Update loaded file
    *state.loaded_file.lock().unwrap() = file_path.clone();

    let args = vec!["--validate".to_string(), file_path];
    let result = run_command(args).await;

    if !result.success {
        return Err(result.msg);
    }

    Ok(analyze_logs(&result.msg))
}

#[tauri::command]
async fn get_metafier_path() -> Result<String, String> {
    load_metafier_path()
}

#[tauri::command]
async fn check_default_path() -> Result<bool, String> {
    let path = load_metafier_path()?;
    let default_path = get_default_metafier_path();

    if path == default_path {
        // Check if metafier is working
        let args = vec!["--version".to_string()];
        let result = run_command(args).await;

        if result.success && result.msg.contains("Metafier application") {
            Ok(true)
        } else {
            Ok(false)
        }
    } else {
        Ok(false)
    }
}

#[tauri::command]
async fn open_xml_dialog(app_handle: tauri::AppHandle) -> Result<Option<FileDialogResult>, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app_handle
        .dialog()
        .file()
        .add_filter("XML | MXF Files", &["xml", "mxf"])
        .blocking_pick_file();

    if let Some(path) = file_path {
        let path_buf = path.as_path().expect("Failed to get path");
        let file_name = path_buf
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        let file_path_str = path_buf.to_string_lossy().to_string();

        Ok(Some(FileDialogResult {
            file_name,
            file_path: file_path_str,
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
async fn save_as_new_xml(
    params: String,
    validate: bool,
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let loaded_file = state.loaded_file.lock().unwrap().clone();
    if loaded_file.is_empty() {
        return Err("No file loaded".to_string());
    }

    // Get default save name
    let default_path = state.default_path.lock().unwrap().clone();
    let base_name = std::path::Path::new(&loaded_file)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("untitled");
    let save_name = format!("{}_edited.xml", base_name);

    let mut dialog = app_handle.dialog().file().add_filter("XML Files", &["xml"]);

    if !default_path.is_empty() {
        dialog = dialog.set_directory(&default_path);
    }

    let file_path = dialog.set_file_name(&save_name).blocking_save_file();

    if let Some(path) = file_path {
        let path_buf = path.as_path().expect("Failed to get path");
        let file_path_str = path_buf.to_string_lossy().to_string();

        // Update default path
        if let Some(parent) = path_buf.parent() {
            *state.default_path.lock().unwrap() = parent.to_string_lossy().to_string();
        }

        // Parse params and create args
        let param_args: Vec<String> = params.split_whitespace().map(|s| s.to_string()).collect();
        let mut args = vec![loaded_file, "--output".to_string(), file_path_str.clone()];
        args.extend(param_args);

        let result = run_command(args).await;

        if !result.success {
            return Ok(result.msg);
        }

        // Validate if requested
        if validate {
            let validate_args = vec!["--validate".to_string(), file_path_str];
            let validate_result = run_command(validate_args).await;
            return Ok(validate_result.msg);
        }

        Ok(result.msg)
    } else {
        Err("Save dialog was cancelled".to_string())
    }
}

#[tauri::command]
async fn export_logs(
    logs: String,
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> Result<bool, String> {
    use tauri_plugin_dialog::DialogExt;

    let loaded_file = state.loaded_file.lock().unwrap().clone();
    let default_path = state.default_path.lock().unwrap().clone();

    // Generate default filename
    let base_name = if !loaded_file.is_empty() {
        std::path::Path::new(&loaded_file)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("report")
    } else {
        "report"
    };

    let now = chrono::Utc::now();
    let date_str = now.format("%Y_%m_%d").to_string();
    let save_name = format!("{}_Mtfr_rprt_{}.txt", base_name, date_str);

    let mut dialog = app_handle
        .dialog()
        .file()
        .add_filter("Text Files", &["txt"])
        .add_filter("All Files", &["*"]);

    if !default_path.is_empty() {
        dialog = dialog.set_directory(&default_path);
    }

    let file_path = dialog.set_file_name(&save_name).blocking_save_file();

    if let Some(path) = file_path {
        let path_buf = path.as_path().expect("Failed to get path");
        // Update default path
        if let Some(parent) = path_buf.parent() {
            *state.default_path.lock().unwrap() = parent.to_string_lossy().to_string();
        }

        match std::fs::write(path_buf, logs) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    } else {
        Ok(false)
    }
}

#[tauri::command]
async fn set_metafier_path_dialog(app_handle: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app_handle.dialog().file().blocking_pick_file();

    if let Some(path) = file_path {
        let path_buf = path.as_path().expect("Failed to get path");
        let path_str = path_buf.to_string_lossy().to_string();
        save_metafier_path(&path_str)?;
        Ok(Some(path_str))
    } else {
        Ok(None)
    }
}

#[tauri::command]
async fn toggle_fullscreen(window: tauri::Window) -> Result<(), String> {
    let is_fullscreen = window
        .is_fullscreen()
        .map_err(|e| format!("Failed to get fullscreen state: {}", e))?;

    window
        .set_fullscreen(!is_fullscreen)
        .map_err(|e| format!("Failed to toggle fullscreen: {}", e))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_app::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            validate_xml,
            get_trim_list,
            get_metafier_path,
            check_default_path,
            open_xml_dialog,
            save_as_new_xml,
            export_logs,
            set_metafier_path_dialog,
            toggle_fullscreen
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod printer;
mod file_handler;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            printer::get_printers,
            printer::print_label,
            file_handler::save_template,
            file_handler::load_template
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

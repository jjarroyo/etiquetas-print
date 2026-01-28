use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Printer {
    name: String,
}

#[tauri::command]
pub fn get_printers() -> Result<Vec<Printer>, String> {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("powershell")
            .args(&["-Command", "Get-Printer | Select-Object -ExpandProperty Name"])
            .output()
            .map_err(|e| e.to_string())?;

        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let printers = stdout
            .lines()
            .map(|line| Printer {
                name: line.trim().to_string(),
            })
            .filter(|p| !p.name.is_empty())
            .collect();

        Ok(printers)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(vec![
            Printer { name: "Mock Printer 1".into() },
            Printer { name: "Mock Printer 2".into() },
        ])
    }
}

#[tauri::command]
pub fn print_label(printer_name: String, _data: String) -> Result<String, String> {
    // Implement standard printing logic here or call external tool
    println!("Printing to {}", printer_name);
    Ok(format!("Sent job to {}", printer_name))
}

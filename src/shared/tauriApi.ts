import { invoke } from "@tauri-apps/api/core";

// Tauri API wrapper to replace Electron IPC calls
export class TauriApi {
  // Validate XML with different modes
  static async validateXml(mode: number): Promise<string> {
    return await invoke("validate_xml", { mode });
  }

  // Get trim list and XML data from file
  static async getTrimList(filePath: string): Promise<any> {
    return await invoke("get_trim_list", { filePath });
  }

  // Export logs to file
  static async exportLogs(logs: string): Promise<boolean> {
    return await invoke("export_logs", { logs });
  }

  // Save as new XML file
  static async saveAsNewXml(
    params: string,
    validate: boolean
  ): Promise<string> {
    return await invoke("save_as_new_xml", { params, validate });
  }

  // Get metafier path
  static async getMetafierPath(): Promise<string> {
    return await invoke("get_metafier_path");
  }

  // Check if default path is valid
  static async checkDefaultPath(): Promise<boolean> {
    return await invoke("check_default_path");
  }

  // Set metafier path via dialog
  static async setMetafierPathDialog(): Promise<string | null> {
    return await invoke("set_metafier_path_dialog");
  }

  // Open XML/MXF file dialog
  static async openXmlDialog(): Promise<{
    file_name: string;
    file_path: string;
  } | null> {
    return await invoke("open_xml_dialog");
  }

  // Toggle fullscreen
  static async toggleFullscreen(): Promise<void> {
    return await invoke("toggle_fullscreen");
  }
}

// Event emitter for file drop events (since Tauri doesn't have the same drag/drop API as Electron)
export class TauriEvents {
  private static listeners: { [key: string]: Function[] } = {};

  static on(channel: string, callback: Function) {
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    this.listeners[channel].push(callback);
  }

  static emit(channel: string, data: any) {
    if (this.listeners[channel]) {
      this.listeners[channel].forEach((callback) => callback(data));
    }
  }

  static off(channel: string, callback?: Function) {
    if (!this.listeners[channel]) return;

    if (callback) {
      this.listeners[channel] = this.listeners[channel].filter(
        (cb) => cb !== callback
      );
    } else {
      this.listeners[channel] = [];
    }
  }
}

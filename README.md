# Dolby Metafier

A cross-platform desktop application for validating and editing Dolby Vision metadata XML files. Built with Tauri (Rust backend) and React (TypeScript frontend), this tool provides a modern interface for working with Dolby Vision Professional Tools' metafier utility.

## Features

- **XML/MXF File Validation**: Validate Dolby Vision metadata files with detailed reporting
- **Metadata Editing**: Edit key metadata parameters including:
  - Frame rate settings
  - Aspect ratios (canvas and image)
  - Mastering monitor configurations
  - Color encoding parameters
  - Level 6 MaxFALL and MaxCLL values
- **Advanced Options**:
  - Positive lift threshold validation
  - CM29 metadata updates
  - Trim removal and black frame insertion
  - Comment addition and version control
- **Export Capabilities**:
  - Save edited XML files
  - Export validation reports
  - Run post-edit validation
- **Cross-Platform**: Native desktop app for Windows, macOS, and Linux

## Prerequisites

### System Requirements
- **Windows**: Windows 10 or later
- **macOS**: macOS 10.15 or later
- **Linux**: Ubuntu 18.04+ or equivalent

### Dependencies
- **Dolby Vision Professional Tools**: The application requires the `metafier` utility to be installed
  - Windows: `C:\Program Files\Dolby\Dolby_Vision_Professional_Tools_v5.5.0\metafier.exe`
  - macOS/Linux: `/usr/local/bin/dolby_vision_professional_tools/metafier`
- **Node.js**: Version 18 or later (for development)
- **Rust**: Latest stable version (for development)

## Installation

### Option 1: Download Pre-built Binaries
Download the latest release from the releases section for your platform.

### Option 2: Build from Source

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd dolby_metafier
```

#### 2. Install Dependencies

**Install Rust:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

**Install Node.js dependencies:**
```bash
npm install
```

**Install Tauri CLI:**
```bash
npm install --save-dev @tauri-apps/cli
```

#### 3. Development Setup

**Start development server:**
```bash
npm run tauri dev
```

This will:
- Start the Vite development server for the frontend
- Compile and run the Rust backend
- Launch the application window

**Frontend only development:**
```bash
npm run dev
```

#### 4. Build for Production

**Build the application:**
```bash
npm run tauri build
```

This creates:
- **Windows**: `.exe` installer and `.msi` package in `src-tauri/target/release/bundle/`
- **macOS**: `.app` bundle and `.dmg` installer in `src-tauri/target/release/bundle/`
- **Linux**: `.deb`, `.rpm`, and `.AppImage` packages in `src-tauri/target/release/bundle/`

## Configuration

### Metafier Path Setup
On first launch, the application will attempt to auto-detect the metafier executable:
- If not found, use the settings dialog to manually select the metafier executable
- The path is saved in the application's data directory for future use

### Application Data Locations
- **Windows**: `%APPDATA%\dolby_metafier\`
- **macOS**: `~/Library/Application Support/dolby_metafier/`
- **Linux**: `~/.local/share/dolby_metafier/`

## Usage

1. **Load XML/MXF File**:
   - Use File → Open or drag and drop files
   - Supported formats: `.xml`, `.mxf`

2. **Validate Files**:
   - Click "RUN VALIDATION" to check file integrity
   - Optional: Enable positive lift threshold checking
   - View results in the console panel

3. **Edit Metadata**:
   - Navigate to the Edit tab
   - Modify parameters in the summary panel
   - Configure advanced options as needed
   - Click "Save as a New File" to export changes

4. **Export Reports**:
   - Click "Export REPORT" to save validation logs
   - Reports are saved with timestamp formatting

## Development

### Project Structure
```
dolby_metafier/
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   ├── redux/             # State management
│   └── shared/            # Utilities and API
├── src-tauri/             # Rust backend source
│   ├── src/               # Rust source files
│   ├── icons/             # Application icons
│   └── Cargo.toml         # Rust dependencies
├── public/                # Static assets
└── dist/                  # Built frontend files
```

### Key Technologies
- **Frontend**: React 19, TypeScript, Material-UI, Redux Toolkit, Tailwind CSS
- **Backend**: Rust, Tauri 2.0, Tokio (async runtime)
- **Build Tools**: Vite, Tauri CLI

### Available Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run tauri dev` - Start full development environment
- `npm run tauri build` - Build application for production

### Backend Commands
The Rust backend exposes these Tauri commands:
- `validate_xml` - Validate XML files with metafier
- `get_trim_list` - Extract metadata and trim information
- `save_as_new_xml` - Save edited XML files
- `export_logs` - Export validation reports
- `open_xml_dialog` - File picker for XML/MXF files

## Packaging

### Windows
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```
Generates:
- `dolby_metafier_0.1.0_x64_en-US.msi`
- `dolby_metafier_0.1.0_x64-setup.exe`

### macOS
```bash
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target aarch64-apple-darwin  # For Apple Silicon
```
Generates:
- `Dolby Metafier.app`
- `Dolby Metafier_0.1.0_x64.dmg`

### Linux
```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```
Generates:
- `dolby-metafier_0.1.0_amd64.deb`
- `dolby-metafier-0.1.0-1.x86_64.rpm`
- `dolby-metafier_0.1.0_amd64.AppImage`

### Cross-compilation
Install target platforms:
```bash
rustup target add x86_64-pc-windows-msvc
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin
rustup target add x86_64-unknown-linux-gnu
```

## Troubleshooting

### Common Issues

**Metafier not found:**
- Ensure Dolby Vision Professional Tools are installed
- Use the application settings to manually set the metafier path
- Verify the executable has proper permissions

**Build failures:**
- Ensure Rust toolchain is up to date: `rustup update`
- Clear build cache: `cargo clean` and `npm run tauri build`
- Check that all system dependencies are installed

**Runtime errors:**
- Check console output for detailed error messages
- Verify input files are valid Dolby Vision metadata
- Ensure sufficient disk space for output files

### Platform-Specific Notes

**Windows:**
- May require Visual Studio Build Tools
- Some antivirus software may flag the executable during development

**macOS:**
- Code signing may be required for distribution
- Gatekeeper may prevent unsigned builds from running

**Linux:**
- Additional system dependencies may be required:
  ```bash
  sudo apt install libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
  ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Built with [Tauri](https://tauri.app/) framework
- Uses [Dolby Vision Professional Tools](https://professional.dolby.com/) metafier utility
- UI components from [Material-UI](https://mui.com/)

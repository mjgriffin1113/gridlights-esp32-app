import os
import time
import subprocess

# Configuration
ESP_PORT = "/dev/tty.SLAB_USBtoUART"  # Change this to your ESP32's port
BAUD_RATE = 115200
FILES_TO_UPLOAD = ['main.py', 'backspace.png', 'logo.png', 'index.html', 'script.js', 'style.css']  # List all files to upload

# Helper function to upload files using ampy
def upload_file(file_path, esp_port, baud_rate):
    try:
        print(f"Uploading {file_path} to ESP32...")
        subprocess.run(["ampy", "--port", esp_port, "--baud", str(baud_rate), "put", file_path], check=True)
        print(f"Successfully uploaded {file_path}.")
    except subprocess.CalledProcessError as e:
        print(f"Failed to upload {file_path}: {e}")

# Main routine to upload all files
def upload_files():
    for file in FILES_TO_UPLOAD:
        if os.path.exists(file):
            upload_file(file, ESP_PORT, BAUD_RATE)
        else:
            print(f"File {file} not found. Skipping.")

# Run the script on ESP32 by resetting it
def reset_esp32():
    print("Resetting ESP32 to run main.py...")
    subprocess.run(["ampy", "--port", ESP_PORT, "reset"], check=True)
    time.sleep(1)  # Give the ESP32 some time to reset
    print("ESP32 reset completed.")

if __name__ == "__main__":
    upload_files()
    reset_esp32()

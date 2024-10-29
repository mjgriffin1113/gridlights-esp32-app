import socket
import re  # Replace `ure` with `re` for regular expressions
import json
# import ujson
import time
import _thread

# Simulate the connected_to_esp32 flag for testing without actual hardware
connected_to_esp32 = False
cycle_running = False

# Simulate UART communication if connected_to_esp32 is True
class MockUART:
    def __init__(self):
        self.buffer = ""

    def write(self, data):
        print(f"UART Write: {data}")
        # Simulate a response from WLED
        if "255,0,0" in data:
            self.buffer = '{"seg":[{"id":0,"col":[255,0,0]}]}'
        elif "0,0,0" in data:
            self.buffer = '{"seg":[{"id":0,"col":[0,0,0]}]}'
        else:
            self.buffer = '{"seg":[{"id":0,"col":[255,255,255]}]}'

    def any(self):
        return len(self.buffer) > 0

    def read(self):
        result = self.buffer
        self.buffer = ""  # Clear buffer after reading
        return result.encode('utf-8')

# Initialize mock UART if connected_to_esp32
if connected_to_esp32:
    import serial  # You would use pySerial to handle UART on a PC
    uart = serial.Serial('/dev/tty.usbserial-02OKI39C', baudrate=115200, timeout=1)
else:
    uart = MockUART()

# Set up a socket server
addr = ('0.0.0.0', 8080)  # Use port 8080 to avoid conflicts with other services
s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind(addr)
s.listen(5)

print('Listening on', addr)

# Serve files
def serve_file(conn, filename, content_type):
    try:
        with open(filename, 'rb') as f:  # Open in binary mode
            conn.sendall(f'HTTP/1.0 200 OK\r\nContent-Type: {content_type}\r\n\r\n'.encode('utf-8'))
            conn.sendall(f.read())  # No encoding needed for binary data
    except OSError as err:
        print(err)
        # conn.sendall('HTTP/1.0 404 NOT FOUND\r\n\r\n'.encode('utf-8'))

def get_saved_name():
    try:
        name = 'User'
        return name
    except OSError:
        return None

# Handle LED command via UART
def handle_led_command(command):

    print(f'handling command {command}')
    if uart:
        uart.write(f'{command}\n'.encode('utf-8'))  # Make sure to send bytes, not a string
        time.sleep(1)  # Adjust sleep time based on your needs

        print('after sleep')
        if uart.in_waiting:  # Check if there is data available in the buffer
            response = uart.read(uart.in_waiting).decode('utf-8')  # Read available data
            print("WLED Response:", response)
            return response
        elif uart.any():
            print(uart.any())
        else:
            print('not waiting')
        
    return "No response"

    # print(f'handling command {command}')
    # if uart:
    #     uart.write(command)
    #     time.sleep(1)  # Adjust sleep time based on your needs

    #     print('after sleep')
    #     if uart.any():
    #         response = uart.read().decode('utf-8')
    #         print("WLED Response:", response)
    #         return response
        
    # return "No response"


# Function to run the cycle in the background
def run_cycle(cycle_time, scene_steps):
    global cycle_running
    while cycle_running:
        for step in scene_steps:
            effect = step['effect']
            color = step['color']
            speed = step['speed']
            brightness = step['brightness']
            percentage = int(step['percentage'])

            # Calculate the time to run each step based on percentage
            step_duration = (cycle_time * 3600) * (percentage / 100)  # Convert hours to seconds

            # Send the command to WLED for the current step
            handle_led_command(effect, color, speed, brightness)

            # Sleep for the duration of this step
            time.sleep(step_duration)


# Process incoming HTTP requests
def handle_request(conn):
    request = conn.recv(1024)
    request_str = request.decode('utf-8')
    print('Request:', request_str)

    global cycle_running

    # Match GET or POST
    match = re.search('(?:GET|POST) /([^ ]*) HTTP', request_str)

    if match:
        method = request_str.split(' ')[0]
        path = match.group(1)
        print(path)

        if method == 'GET':
            if path == '' or path == 'index.html':
                serve_file(conn, 'index.html', 'text/html')
            if path == 'automation':
                serve_file(conn, 'automation.html', 'text/html')
            elif path == 'style.css':
                serve_file(conn, 'style.css', 'text/css')
            elif path == 'script.js':
                serve_file(conn, 'script.js', 'application/javascript')
            elif path == 'username':
                print('hy')
                response = bytes(json.dumps({'username': 'griff'}), 'utf-8')
    
                # Send HTTP response headers, encoded to bytes
                conn.send(b'HTTP/1.1 200 OK\n')
                conn.send(b'Content-Type: application/json\n')
                conn.send(b'Connection: close\n\n')
                
                # Send the actual JSON response
                conn.sendall(response)
                
                # Close the connection
                conn.close()
            elif path == 'logo.png':
                try:
                    serve_file(conn, 'logo.png', 'image/png')
                    print('served')
                except Exception as e:
                    print('caught!')
                    print(e)
            elif path == 'backspace.png':
                try:
                    serve_file(conn, 'backspace.png', 'image/png')
                    print('served')
                except Exception as e:
                    print('caught!')
                    print(e)
            else:
                print(f'Could not find {path}')
                # conn.sendall('HTTP/1.0 404 NOT FOUND\r\n\r\n'.encode('utf-8'))
        
        elif method == 'POST' and path == 'led':
            print('Processing LED command')
            command_start = request_str.find('\r\n\r\n') + 4
            command_json = request_str[command_start:]
            print(command_start)
            print(command_json)

            # Ensure JSON is properly handled
            try:
                # Parse the received JSON from the byte data
                # command_dict = json.loads(command_json.encode('utf-8'))  # Decoding from bytes to string
                response = handle_led_command(command_json)  # Use json.dumps for proper formatting
                cycle_running = False
                # # Encode the response as bytes before sending back
                # return response.encode('utf-8')  # This sends the response back in bytes
                conn.sendall('HTTP/1.1 200 OK\n'.encode('utf-8'))
                conn.sendall('Content-Type: application/json\n'.encode('utf-8'))
                conn.sendall('Connection: close\n\n'.encode('utf-8'))
                conn.sendall(response.encode('utf-8'))
            except ValueError:
                conn.sendall('HTTP/1.1 400 BAD REQUEST\n'.encode('utf-8'))
                conn.sendall('Content-Type: application/json\n'.encode('utf-8'))
                conn.sendall('Connection: close\n\n'.encode('utf-8'))
                conn.sendall(json.dumps({"error": "Invalid JSON"}).encode('utf-8'))
            except Exception as err:
                conn.sendall('HTTP/1.1 400 BAD REQUEST\n'.encode('utf-8'))
                conn.sendall('Content-Type: application/json\n'.encode('utf-8'))
                conn.sendall('Connection: close\n\n'.encode('utf-8'))
                conn.sendall(json.dumps({"error": str(err)}).encode('utf-8'))
        
        elif method=="POST" and path == "runCycle":
            command_start = request_str.find('\r\n\r\n') + 4
            command_json = request_str[command_start:]
            print(command_start)
            print(command_json)
            # Parse the JSON data from the request (e.g., sceneSteps and cycleTime)
            data = json.loads(command_json)  # Adjust according to your actual request parsing
            cycle_time = int(data['cycleTime'])  # Extract the cycle time (hours)
            scene_steps = data['sceneSteps']  # Extract the scene steps (effects, colors, etc.)

            # Start the cycle in a separate thread so it doesn't block the server
            _thread.start_new_thread(run_cycle, (cycle_time, scene_steps))
            cycle_running = True
    else:
        conn.sendall('HTTP/1.0 400 BAD REQUEST\r\n\r\n'.encode('utf-8'))

    conn.close()

while True:
    try:
        conn, addr = s.accept()
        print('Connection from', addr)
        handle_request(conn)
    except Exception as e:
        print("Exception occurred:", e)
    finally:
        conn.close()  # Ensure connection is always closed
        print('done')

import http.server
import socketserver
import threading
import time
import os

# Port to run the server on
PORT = 8080

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run_server():
    # Allow port reuse to avoid "Address already in use" errors
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
        print(f"\n🚀 Server started at http://localhost:{PORT}")
        print("📱 To view the app in Pydroid 3, open your browser and go to http://localhost:8080")
        print("🛠️ Admin Panel: http://localhost:8080/admin.html")
        httpd.serve_forever()

if __name__ == "__main__":
    # Ensure index.html exists in the same directory
    if not os.path.exists("index.html"):
        print("Error: index.html not found in the current directory!")
    else:
        # Start the server in a separate thread
        server_thread = threading.Thread(target=run_server)
        server_thread.daemon = True
        server_thread.start()

        print("\n--- Kim Service Center Premium Website Runner ---")
        print(f"Running on port {PORT}...")

        try:
            # Keep the script running
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nShutting down server...")

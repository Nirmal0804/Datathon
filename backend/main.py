"""AppSail entry point at backend root."""
import os
import sys
import json
import traceback
from pathlib import Path

# Ensure backend and vendor directories are in python path
backend_dir = Path(__file__).resolve().parent
vendor_dir = backend_dir / "vendor"
if vendor_dir.exists() and str(vendor_dir) not in sys.path:
    sys.path.insert(0, str(vendor_dir))
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

def get_port() -> int:
    port_keys = ["X_ZOHO_CATALYST_LISTEN_PORT", "PORT", "CATALYST_PORT", "LISTEN_PORT"]
    for k in port_keys:
        val = os.environ.get(k)
        if val:
            try:
                return int(val)
            except ValueError:
                pass
    return 9000

if __name__ == "__main__":
    port = get_port()
    print(f"[AppSail] Booting CrimeIntel on port {port}...")
    try:
        import uvicorn
        from app.main import app
        print(f"[AppSail] Starting CrimeIntel FastAPI server on 0.0.0.0:{port}...")
        uvicorn.run(app, host="0.0.0.0", port=port, proxy_headers=True, forwarded_allow_ips="*")
    except Exception:
        err = traceback.format_exc()
        print(f"[AppSail Startup Error]:\n{err}")
        from http.server import HTTPServer, BaseHTTPRequestHandler
        class FallbackHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                data = {
                    "status": "startup_failed",
                    "error": err,
                    "python": sys.version,
                    "sys_path": sys.path
                }
                self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))
        server = HTTPServer(("0.0.0.0", port), FallbackHandler)
        server.serve_forever()

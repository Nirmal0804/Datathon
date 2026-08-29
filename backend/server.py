"""AppSail server entry point."""
from main import get_port, uvicorn, app

if __name__ == "__main__":
    port = get_port()
    print(f"[AppSail] Starting CrimeIntel FastAPI Backend on 0.0.0.0:{port}...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        proxy_headers=True,
        forwarded_allow_ips="*"
    )

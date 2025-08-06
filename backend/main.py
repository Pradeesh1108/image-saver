from fastapi import FastAPI
from pydantic import BaseModel
from scraper import extract_instagram_media
from fastapi.middleware.cors import CORSMiddleware
import requests
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi import Query
import io
app = FastAPI()


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ed6388f41cc0.ngrok-free.app",
]

class URLRequest(BaseModel):
    url: str
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # frontend origin here later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend is up and running!"}
@app.post("/download")
async def download_media(request: URLRequest):
    try:
        print(f"Attempting to fetch media from: {request.url}")
        media_urls = extract_instagram_media(request.url)
        print(f"Successfully extracted {len(media_urls)} media URLs")
        return {"success": True, "media": media_urls}
    except Exception as e:
        print(f"Error extracting media: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/proxy-image")
async def proxy_image(url: str = Query(...)):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
            "Referer": "https://www.instagram.com/"
        }
        resp = requests.get(url, headers=headers, allow_redirects=True)
        resp.raise_for_status()
        content_type = resp.headers.get("Content-Type", "image/jpeg")
        print("Received Content-Type:", content_type)

        # Add CORS headers to the image response
        return Response(
            content=resp.content,
            media_type=content_type,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Cache-Control": "public, max-age=3600"
            }
        )
    except Exception as e:
        print(f"Proxy error: {e}")
        return {"error": f"Proxy error: {str(e)}"}

@app.options("/proxy-image")
async def proxy_image_options():
    return JSONResponse(
        content={"message": "OK"}, 
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

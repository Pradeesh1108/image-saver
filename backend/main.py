from fastapi import FastAPI, Response
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
    "https://d2dc5229327b.ngrok-free.app",
    "https://bf8943571d8a.ngrok-free.app",
    "https://3818111a33c3.ngrok-free.app",
    "https://b173e7044154.ngrok-free.app ",
    "https://3dc3e97f5453.ngrok-free.app",

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
        # More sophisticated headers to better mimic Instagram's official app
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 "
                "(KHTML, like Gecko) Version/17.1.2 Mobile/15E148 Safari/604.1"
            ),
            "Referer": "https://www.instagram.com/",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Sec-Fetch-Dest": "image",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "cross-site",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "X-Requested-With": "XMLHttpRequest",
        }
        
        print(f"Fetching image from: {url}")
        
        # Add a small delay to avoid rate limiting
        import time
        time.sleep(0.1)
        
        resp = requests.get(url, headers=headers, allow_redirects=True, timeout=20)
        resp.raise_for_status()

        content_type = resp.headers.get("Content-Type", "")
        print(f"Fetched content-type: {content_type}")
        print(f"Response size: {len(resp.content)} bytes")

        # Check if we got HTML instead of an image
        if "text/html" in content_type.lower():
            print("Returned HTML instead of image. Likely blocked by Instagram.")
            # Try to extract error message from HTML
            html_content = resp.text[:500]  # First 500 chars
            print(f"HTML content preview: {html_content}")
            return JSONResponse(
                content={"error": "Instagram blocked image access. The image URL may be expired or restricted."},
                status_code=403
            )

        # Check if content is too small (likely an error page)
        if len(resp.content) < 5000:
            print("Response too small, likely an error page")
            return JSONResponse(
                content={"error": "Image response too small, likely blocked or expired."},
                status_code=403
            )

        return Response(
            content=resp.content,
            media_type=content_type,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=3600",
                "Content-Length": str(len(resp.content))
            }
        )

    except requests.exceptions.Timeout:
        print("Request timeout")
        return JSONResponse(content={"error": "Request timeout"}, status_code=408)
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return JSONResponse(content={"error": f"Request failed: {str(e)}"}, status_code=500)
    except Exception as e:
        print(f"Proxy error: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)



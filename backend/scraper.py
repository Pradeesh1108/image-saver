import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def extract_instagram_media(url: str):
    api_key = os.environ.get("RAPIDAPI_KEY")
    if not api_key:
        raise ValueError("RAPIDAPI_KEY is missing! Please create a .env file in the backend folder with your RapidAPI key.")

    # Using the specific API you provided
    api_url = "https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/convert"
    querystring = {"url": url}
    
    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com"
    }

    print(f"Calling user-provided RapidAPI for URL: {url}")
    response = requests.get(api_url, headers=headers, params=querystring)
    
    if response.status_code != 200:
        raise ValueError(f"API Error ({response.status_code}): {response.text}")
        
    data = response.json()
    media_urls = []
    
    try:
        # The API can return either a list directly, or a dict with a 'media' key
        items = data.get('media', []) if isinstance(data, dict) else data
        
        if isinstance(items, list):
            for item in items:
                if 'url' in item:
                    media_urls.append(item['url'])
        else:
            raise ValueError("Expected a list from the API.")
                
    except Exception as e:
        print(f"Raw API Response: {data}")
        raise ValueError(f"Failed to parse the API response. Error: {e}")

    if not media_urls:
        raise ValueError("No media found in the post. Check if the URL is correct and public.")

    return media_urls

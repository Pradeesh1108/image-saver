import instaloader
import re

def extract_instagram_media(url: str):
    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        save_metadata=False
    )

    # Match both /p/ and /reel/ URLs
    shortcode_match = re.search(r"/(p|reel)/([A-Za-z0-9_-]+)/?", url)
    if not shortcode_match:
        raise ValueError("Invalid Instagram URL format")

    shortcode = shortcode_match.group(2)
    post = instaloader.Post.from_shortcode(L.context, shortcode)

    media_urls = []

    if post.typename == 'GraphSidecar':
        # Carousel: multiple images/videos
        for node in post.get_sidecar_nodes():
            if node.is_video:
                media_urls.append(node.video_url)
            else:
                media_urls.append(node.display_url)
    else:
        # Single image or video
        media_urls.append(post.video_url if post.is_video else post.url)

    return media_urls

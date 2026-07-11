import browser_cookie3
import instaloader
import os

print("Extracting Instagram cookies from Chrome...")
try:
    cj = browser_cookie3.chrome(domain_name='instagram.com')
except Exception as e:
    print(f"Failed to extract cookies: {e}")
    print("Make sure you are logged into Instagram on Chrome!")
    exit(1)

L = instaloader.Instaloader()
# Inject cookies into instaloader's requests session
L.context._session.cookies.update(cj)

print("Testing login with extracted cookies...")
try:
    username = L.test_login()
    if username:
        session_file = f"session-{username}"
        L.save_session_to_file(session_file)
        print(f"\nSUCCESS! Saved session for '{username}' to '{session_file}'.")
        print("The backend will now automatically use this session!")
    else:
        print("\nCookies found, but you are not logged in. Please log in to instagram.com on Chrome and try again.")
except Exception as e:
    print(f"\nError testing login: {e}")

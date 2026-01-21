import re
import os

pages = [
    'favorites.html',
    'recent.html',
    'themes/weweb.html',
    'themes/xano.html',
    'themes/api.html',
    'themes/bonnes-pratiques.html',
    'themes/notes-diverses.html',
    'themes/retrospectives.html'
]

for page_path in pages:
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace navbar with injection point
    # Match from <nav class="navbar"> to </nav>
    navbar_pattern = r'<nav class="navbar">.*?</nav>'
    replacement = '<div id="navbar-root"></div>'
    
    content = re.sub(navbar_pattern, replacement, content, flags=re.DOTALL)
    
    # Add navbar.js script before power-ux.js
    is_theme = 'themes/' in page_path
    script_path = '../public/js/navbar.js' if is_theme else 'public/js/navbar.js'
    
    if script_path not in content:
        if is_theme:
            content = content.replace(
                '<script src="../public/js/power-ux.js" defer></script>',
                f'<script src="{script_path}" defer></script>\n    <script src="../public/js/power-ux.js" defer></script>'
            )
        else:
            content = content.replace(
                '<script src="public/js/power-ux.js" defer></script>',
                f'<script src="{script_path}" defer></script>\n    <script src="public/js/power-ux.js" defer></script>'
            )
    
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Updated {page_path}')

print('All pages updated!')

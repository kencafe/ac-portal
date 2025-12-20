import sys
import os
import json
import re
import glob
from pathlib import Path

# Add dependency path
sys.path.append(os.path.join(os.path.dirname(__file__), '.libs'))

import markdown
from bs4 import BeautifulSoup

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTENT_DIR = os.path.join(BASE_DIR, 'content')
STITCH_DIR = os.path.join(BASE_DIR, 'stitch', 'stitch_khu_v_c_d_ch_v')
OUTPUT_DIR = BASE_DIR

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def parse_markdown_metadata(md_content):
    """
    Parse frontmatter and content from markdown.
    """
    meta = {}
    content = md_content
    
    if md_content.startswith('---'):
        parts = md_content.split('---', 2)
        if len(parts) >= 3:
            frontmatter = parts[1]
            content = parts[2]
            
            for line in frontmatter.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    if key == 'tags':
                        # Simple list parsing
                        value = [t.strip().strip('"').strip("'") for t in value.strip('[]').split(',')]
                    meta[key] = value
                    
    return meta, content.strip()

def process_homepage(page_config):
    print("Processing Homepage...")
    template_path = os.path.join(STITCH_DIR, 'trang_chủ_app_carrier', 'code.html')
    content_path = os.path.join(CONTENT_DIR, page_config['content'])
    
    html = read_file(template_path)
    md_content = read_file(content_path)
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Simple parse of Homepage MD
    # Assume H1 is first line
    lines = md_content.split('\n')
    h1_text = ""
    p_text = ""
    services_list = []
    
    current_section = None
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        if line.startswith('# '):
            h1_text = line[2:]
        elif line.startswith('## '):
            current_section = line[3:]
        elif line.startswith('- '):
            if current_section == "Dịch vụ chính":
                services_list.append(line[2:])
        elif not h1_text and not line.startswith('#'):
             pass 
        elif h1_text and not p_text and not line.startswith('#') and not current_section:
             p_text = line

    # Update Hero
    if h1_text:
        # Try to preserve the <span class="text-gradient"> if appropriate, 
        # but for now just replacing text might break the design if not careful.
        # The template has: App Carrier – <br/> <span class="text-gradient">Nền tảng Cloud, AI & Engineering</span>
        # Markdown: App Carrier – Nền tảng Cloud, AI & Platform Engineering
        # We'll split it or just put it all in H1.
        h1_tag = soup.find('h1')
        if h1_tag:
            # Check if we can split using '–'
            if '–' in h1_text:
                part1, part2 = h1_text.split('–', 1)
                h1_tag.clear()
                h1_tag.append(part1.strip() + ' – ')
                br = soup.new_tag('br')
                h1_tag.append(br)
                span = soup.new_tag('span', attrs={'class': 'text-gradient'})
                span.string = part2.strip()
                h1_tag.append(span)
            else:
                h1_tag.string = h1_text

    if p_text:
        # Find the paragraph under H1
        # The template has a P with class text-lg text-gray-300...
        p_tag = soup.find('p', class_='text-gray-300') 
        # Use a more robust selector?
        # The hero p is usually the first p with text-lg or similar.
        hero_section = soup.find('h1').find_parent('div')
        p_tag = hero_section.find('p')
        if p_tag:
            p_tag.string = p_text

    # Update Services Cards
    # Template has sections. The first grid under "Giải pháp Công nghệ Toàn diện".
    # Selector: section h2 contains "Giải pháp".
    # Actually the h2 is "Giải pháp Công nghệ Toàn diện".
    
    # Find the section headers
    for section in soup.find_all('section'):
        h2 = section.find('h2')
        if h2 and "Giải pháp" in h2.get_text():
            # This is the services section
            grid = section.find('div', class_='grid')
            if grid:
                cards = grid.find_all('div', recursive=False)
                # We have 3 cards in template, and potentially more items in markdown list
                for i, item in enumerate(services_list[:len(cards)]):
                    card = cards[i]
                    h3 = card.find('h3')
                    if h3:
                        h3.string = item
                    # We assume markdown doesn't have description for these items in homepage.md
                    
    write_file(os.path.join(OUTPUT_DIR, 'index.html'), str(soup))
    print("Homepage generated.")


def process_services(page_config):
    print("Processing Services...")
    # Path might need URL decoding if using actual file system
    # 'khu_vực_dịch_vụ' -> 'khu_vu\u031b\u0323c_di\u0323ch_vu\u0323'
    # We'll rely on glob to find the directory if exact name fails, 
    # but let's try the name from list_dir.
    
    # Try to find the directory first
    dirs = glob.glob(os.path.join(STITCH_DIR, '*gu*ch_v*')) # Fuzzy match 'dich vu'
    if not dirs:
        dirs = glob.glob(os.path.join(STITCH_DIR, 'khu_vu*'))
        
    template_dir = dirs[0] if dirs else os.path.join(STITCH_DIR, 'khu_vực_dịch_vụ')
    template_path = os.path.join(template_dir, 'code.html')
    
    content_path = os.path.join(CONTENT_DIR, 'services.md')
    
    html = read_file(template_path)
    md_content = read_file(content_path)
    soup = BeautifulSoup(html, 'html.parser')
    
    # Parse Services MD
    # It has H1, then H2 sections with lists.
    lines = md_content.split('\n')
    h1_text = ""
    sections = {} # { "Section Name": ["Item 1", "Item 2"] }
    current_section = None
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        if line.startswith('# '):
            h1_text = line[2:]
        elif line.startswith('## '):
            current_section = line[3:]
            sections[current_section] = []
        elif line.startswith('- ') and current_section:
            sections[current_section].append(line[2:])

    # Update H1
    h1 = soup.find('h1')
    if h1 and h1_text:
         # Template: Giải pháp & Dịch vụ <br> Công nghệ Toàn diện
         # Markdown: Dịch vụ App Carrier
         # We just replace it.
         h1.string = h1_text

    # Update Grids
    # Grid 1: Cloud Platform Engineering
    # Look for H3 "Cloud Platform Engineering"
    
    # We iterate through sections found in markdown
    # And map them to the H3 headers in HTML
    
    for section_name, items in sections.items():
        # Find the H3 matching this section name
        # The template has H3 "Cloud Platform Engineering"
        # and "AI & Automation Services" (which maps to AI sections?)
        
        # Specific Logic derived from analysis:
        # Markdown "Cloud Platform Engineering" -> HTML First Grid (under "Cloud Platform Engineering")
        
        if section_name == "Cloud Platform Engineering":
            # Find the header
            header = soup.find(lambda tag: tag.name == "h3" and "Cloud Platform" in tag.get_text())
            if header:
                # The grid is likely in the next sibling or parent's sibling
                # In the template: 
                # <div class="mb-24"> <div ... H3 ...> ... <div class="grid ...">
                container = header.find_parent('div').find_parent('div')
                grid = container.find_next_sibling('div', class_='grid')
                
                if grid:
                    cards = grid.find_all('div', recursive=False)
                    # Use existing cards
                    for i, item in enumerate(items[:len(cards)]):
                         # Item is just text "Tư vấn kiến trúc..."
                         # Template card has H4 (Title) and P (Desc).
                         # But markdown only provides "Item". 
                         # We'll set H4 to the Item. P can be cleared or set to generic.
                         card = cards[i]
                         h4 = card.find('h4')
                         if h4: h4.string = item
                         p = card.find('p')
                         if p: p.string = "" # Clear description as we don't have it
                         
        elif section_name in ["AI / ML Ops", "AI Infrastructure", "AI Cloud", "Automation"]:
            # These map to the second grid "AI & Automation Services"
            header = soup.find(lambda tag: tag.name == "h3" and "AI & Automation" in tag.get_text())
            if header:
                container = header.find_parent('div').find_parent('div')
                grid = container.find_next_sibling('div', class_='grid')
                if grid:
                    cards = grid.find_all('div', recursive=False)
                    
                    # Need to map specific section to specific card
                    # Sections: AI / ML Ops, AI Infrastructure, AI Cloud, Automation
                    # Cards have H4 titles: AI/ML Ops, AI Infrastructure, AI Cloud, Automation (RPA)
                    
                    # Find card with title matching section_name
                    for card in cards:
                        h4 = card.find('h4')
                        if h4 and (section_name in h4.get_text() or (section_name == "Automation" and "Automation" in h4.get_text())):
                            # Found the card. Populate description with list items.
                            p = card.find('p')
                            if p and items:
                                p.string = ", ".join(items)

    output_path = os.path.join(OUTPUT_DIR, 'services', 'index.html')
    write_file(output_path, str(soup))
    print("Services generated.")


def process_blog(page_config):
    print("Processing Blog...")
    
    # Find template
    dirs = glob.glob(os.path.join(STITCH_DIR, 'trang_blog_co*he_1'))
    template_dir = dirs[0] if dirs else os.path.join(STITCH_DIR, 'trang_blog_công_nghệ_1')
    template_path = os.path.join(template_dir, 'code.html')
    
    html = read_file(template_path)
    soup = BeautifulSoup(html, 'html.parser')

    # Find Article Grid
    # Selector: .grid inside a section with "Latest Articles"
    latest_section = soup.find(lambda tag: tag.name == "h3" and "Latest Articles" in tag.get_text())
    grid = None
    article_template = None
    
    if latest_section:
        grid = latest_section.find_parent('div').find_next_sibling('div', class_='grid')
        if grid:
            # Clone first article as template
            first_article = grid.find('article')
            if first_article:
                article_template = first_article.__copy__()
                # Clear grid
                grid.clear()

    # Read Blog Posts
    blog_dir = os.path.join(BASE_DIR, 'blog') # Check if it's blog/ or content/blog
    # From file list, it's /Users/kencafe/data/ac-portal/blog
    # But files are like 001-ai-mlops.md
    
    files = sorted(glob.glob(os.path.join(blog_dir, '*.md')), reverse=True)
    
    for file_path in files:
        md_content = read_file(file_path)
        meta, content = parse_markdown_metadata(md_content)
        
        slug = Path(file_path).stem
        
        # Create List Item
        if grid and article_template:
            new_article = article_template.__copy__()
            
            # Update Title
            h3 = new_article.find('h3')
            if h3: 
                h3.string = meta.get('title', slug)
                
            # Update Excerpt (P)
            p = new_article.find('p')
            if p:
                p.string = content[:150] + "..." if len(content) > 150 else content
                
            # Update Date
            date_div = new_article.find('div', class_=['text-xs', 'uppercase']) # Heuristic
            if date_div:
                date_div.string = meta.get('date', '')
                
            # Update Category
            cat_div = new_article.find('div', class_=['absolute', 'top-4'])
            if cat_div:
                cat_div.string = meta.get('category', 'Tech')
                
            # Update Author
            author_span = new_article.find('span', string=re.compile("Sarah|Alex|David")) # Replace placeholder names
            # Actually easier to utilize the structure
            # <span class="text-xs font-bold ...">Name</span>
            # We'll search for the span containing the name in the original template or just any span with similar class in the footer
            footer = new_article.find('div', class_=['mt-auto', 'border-t'])
            if footer:
                spans = footer.find_all('span')
                if len(spans) > 0:
                    spans[0].string = meta.get('author', 'App Carrier')
            
            # Link to detail page
            # We assume detail page is generated at blog/slug.html
            # Or blog/slug/index.html
            # Let's use blog/slug.html and handle pretty URLs later or use slug/index.html
            link_url = f"{slug}.html"
            
            # Finding <a> tags? The article itself might not be an <a> but contains one or relies on JS?
            # Template has: <h3 ... group-hover:text-primary ...>Title</h3>
            # It seems the article doesn't have an <a> tag wrapper in the template analyzed above?
            # Wait, looking at clean template: <article class="group ..."> ... </article>
            # It seems it relies on JS or maybe I missed the <a>.
            # Ah, the template `trang_blog_công_nghệ_1` has no <a> tag around the article title in the code snippet I saw?
            # Wait, line 179: <h3 class="...">Zero Trust...</h3>
            # No <a> tag. This is strange for a blog list.
            # Maybe the whole card is clickable via JS?
            # I will wrap the title in an <a> tag or wrap the whole article content.
            # I'll wrap the title.
            if h3:
                a = soup.new_tag('a', href=link_url)
                a.string = h3.string
                h3.clear()
                h3.append(a)

            grid.append(new_article)
            
        # Generate Detail Page
        generate_blog_detail(meta, content, html, slug)

    output_path = os.path.join(OUTPUT_DIR, 'blog', 'index.html')
    write_file(output_path, str(soup))
    print("Blog generated.")

def generate_blog_detail(meta, content, list_template_html, slug):
    # Use list template as base but replace main content
    soup = BeautifulSoup(list_template_html, 'html.parser')
    
    # 1. Update Title
    # Try to find the hero section
    # The list page has a hero section title "Engineering the Future of Government Cloud"
    # We'll replace that with the Post Title
    
    h1 = soup.find('h1')
    if h1:
        h1.string = meta.get('title', 'Blog Post')
        # Remove the <span text-primary> part if it was there
    
    # 2. Update Description/Excerpt in Hero
    hero_p = soup.find('p', class_='text-lg')
    if hero_p:
        hero_p.string = "" # Clear it or put tags? 
    
    # 3. Replace the "Latest Articles" section with the Post Content
    latest_section_header = soup.find(lambda tag: tag.name == "h3" and "Latest Articles" in tag.get_text())
    if latest_section_header:
        # Find the section container
        section = latest_section_header.find_parent('div').find_parent('section')
        section.clear()
        
        # Build Content Container
        container = soup.new_tag('div', attrs={'class': 'max-w-3xl mx-auto px-4 py-12 prose lg:prose-xl dark:prose-invert'})
        
        # Convert MD Content to HTML
        html_content = markdown.markdown(content)
        content_div = BeautifulSoup(html_content, 'html.parser')
        container.append(content_div)
        
        section.append(container)

    # Save
    write_file(os.path.join(OUTPUT_DIR, 'blog', f'{slug}.html'), str(soup))

def process_cms(page_config):
    print("Processing CMS...")
    # Find template
    # Template: trang_blog_công_nghệ_2
    dirs = glob.glob(os.path.join(STITCH_DIR, 'trang_blog_co*he_2'))
    template_dir = dirs[0] if dirs else os.path.join(STITCH_DIR, 'trang_blog_công_nghệ_2')
    template_path = os.path.join(template_dir, 'code.html')
    
    html = read_file(template_path)
    output_path = os.path.join(OUTPUT_DIR, 'cms', 'index.html')
    write_file(output_path, html)
    print("CMS generated.")

def main():
    config_path = os.path.join(BASE_DIR, 'pages.json')
    if not os.path.exists(config_path):
        print("pages.json not found")
        return

    config = json.loads(read_file(config_path))
    
    for page in config['pages']:
        if page['name'] == 'Trang chủ':
            process_homepage(page)
        elif page['name'] == 'Dịch vụ':
            process_services(page)
        elif page['name'] == 'Blog':
            process_blog(page)
        elif page['name'] == 'CMS':
            process_cms(page)

if __name__ == '__main__':
    main()

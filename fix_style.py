import os

file_path = r'c:\dattacity\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('</style>\n\n</style>', '</style>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Double style tags fixed!")

import os
from PIL import Image,UnidentifiedImageError

size = 519,507
for file in os.listdir('.'):
	try:
		im = Image.open('./'+file)
		im.thumbnail(size,Image.ANTIALIAS)
		im.save(file,"PNG")
	except UnidentifiedImageError:
		print('error with '+file)

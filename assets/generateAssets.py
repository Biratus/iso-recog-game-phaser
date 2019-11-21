import os

folders = []
path = './assets/'
for f in os.listdir(path):
	if(os.path.isdir(path+f)):
		folders.append(f)
assets = {}
for f in folders:
	assets[f] = '"'+'",\n"'.join(os.listdir(path+f))+'"'
assetFile = open(path+"json/assets.json","w+")
assetFile.write("{\n");
i = 1;
for a in assets:
	assetFile.write('"'+a+'": [\n'+assets.get(a)+'\n]'+('\n',',\n')[i<len(assets)])
	i += 1
assetFile.write("}")

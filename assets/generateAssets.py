import os

folders = []
assets = {}
for f in os.listdir('.'):
	if(os.path.isdir(f)):
		folders.append(f)
for f in folders:
	assets[f] = '"'+'",\n"'.join(os.listdir(f))+'"'
assetFile = open("./json/assets.json","w+")
assetFile.write("{\n");
i = 1;
for a in assets:
	assetFile.write('"'+a+'": [\n'+assets.get(a)+'\n]'+('\n',',\n')[i<len(assets)])
	i += 1
assetFile.write("}")

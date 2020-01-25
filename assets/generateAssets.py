import os
import json

folders = []
path = './assets'
assets = {}


def main():

    for f in os.listdir(path):
        if os.path.isdir(path+'/'+f):
            assets[f] = getContent([f])

    assetFile = open(path+"/json/assets.json", "w+")
    assetFile.write(json.dumps(assets))

def getContent(pathList):
	content = []
	currentPath = path+'/'+'/'.join(pathList)
	print(f'{currentPath}')
	for f in os.listdir(currentPath):
		if os.path.isdir(currentPath+'/'+f):
			content.extend(getContent(pathList+[f]))
		else: 
			currentPathList = pathList+[f[:f.rfind('.')]]
			content.append({"key":'.'.join(currentPathList[1:]),"path":'/'.join(pathList)+'/'+f})
	return content

main()

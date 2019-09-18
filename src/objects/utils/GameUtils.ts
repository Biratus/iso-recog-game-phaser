import ArrayUtils from "./ArrayUtils";

export module GameModule {
	export var debug = true;
	export var currentScene: Phaser.Scene;
	export var Unistrokes = {
		"triangle": [
			[[191, 204], [191, 206], [191, 208], [187, 215], [185, 219], [179, 231], [178, 235], [173, 253], [169, 264], [166, 269], [164, 274], [162, 276], [159, 282], [159, 285], [156, 292], [155, 294], [155, 295], [157, 295], [160, 295], [161, 295], [166, 295], [168, 295], [176, 296], [180, 296], [185, 296], [191, 296], [194, 296], [204, 296], [206, 296], [212, 296], [214, 296], [219, 296], [221, 296], [228, 298], [232, 298], [235, 299], [239, 299], [241, 299], [242, 299], [242, 298], [241, 296], [240, 294], [240, 291], [238, 287], [237, 285], [234, 280], [233, 276], [228, 269], [228, 265], [224, 259], [222, 256], [218, 249], [216, 244], [213, 239], [211, 236], [210, 232], [208, 228], [207, 227], [204, 222], [202, 219], [200, 219], [200, 218], [200, 217], [199, 217], [198, 216], [197, 215], [196, 212], [193, 207], [192, 204], [191, 203], [191, 202]],
			[[253, 182], [252, 184], [251, 186], [251, 190], [248, 196], [245, 201], [241, 217], [231, 242], [227, 249], [216, 274], [214, 282], [210, 292], [209, 294], [209, 295], [210, 295], [212, 295], [215, 295], [219, 295], [230, 295], [251, 295], [261, 295], [275, 294], [285, 294], [296, 294], [299, 294], [302, 294], [307, 292], [308, 292], [309, 292], [309, 291], [309, 290], [309, 289], [307, 286], [305, 278], [303, 276], [296, 264], [290, 255], [287, 247], [281, 238], [276, 230], [270, 218], [267, 209], [261, 198], [260, 197], [258, 191], [256, 189], [252, 183], [250, 179], [249, 179], [249, 178]]
		],
		"square": [
			[[0, 0], [0, 100], [100, 100], [100, 0], [0, 0]],
			[[50, 50], [49, 102], [101, 100], [102, 49], [51, 48]]
		],
		"rectangle": [
			[[132, 159], [132, 162], [132, 163], [132, 170], [132, 174], [132, 176], [130, 179], [130, 185], [130, 188], [129, 194], [129, 195], [129, 198], [129, 199], [129, 200], [128, 203], [128, 204], [130, 204], [133, 204], [140, 204], [144, 204], [155, 204], [167, 204], [172, 204], [180, 204], [183, 205], [197, 206], [199, 206], [206, 205], [208, 205], [215, 205], [223, 204], [226, 204], [231, 204], [232, 204], [235, 203], [236, 203], [237, 202], [237, 201], [237, 200], [238, 196], [239, 193], [240, 186], [240, 185], [241, 179], [241, 176], [241, 175], [241, 170], [241, 168], [242, 164], [242, 163], [242, 159], [243, 157], [243, 155], [243, 153], [243, 151], [243, 150], [243, 149], [242, 149], [241, 149], [240, 149], [235, 149], [232, 149], [226, 149], [223, 149], [217, 150], [213, 150], [203, 151], [199, 151], [194, 151], [191, 152], [184, 152], [178, 152], [174, 152], [170, 152], [168, 152], [163, 152], [157, 152], [154, 152], [150, 152], [149, 152], [146, 152], [145, 152], [144, 152], [143, 152]],
			[[165, 296], [165, 298], [165, 299], [165, 300], [165, 304], [165, 310], [165, 314], [165, 321], [165, 323], [165, 335], [165, 339], [165, 348], [165, 354], [165, 356], [164, 360], [164, 363], [164, 362], [165, 362], [166, 362], [168, 361], [170, 360], [174, 360], [178, 360], [181, 359], [185, 357], [189, 357], [197, 357], [200, 357], [206, 357], [212, 356], [218, 356], [223, 356], [227, 356], [233, 356], [236, 355], [246, 354], [249, 354], [256, 354], [259, 354], [263, 355], [273, 356], [278, 359], [284, 359], [287, 359], [291, 361], [293, 361], [297, 362], [300, 362], [302, 363], [302, 362], [302, 361], [302, 359], [302, 358], [302, 354], [302, 351], [302, 349], [302, 346], [302, 345], [302, 341], [302, 339], [302, 332], [302, 330], [302, 326], [302, 324], [302, 322], [302, 319], [301, 317], [301, 313], [301, 311], [301, 309], [300, 307], [300, 305], [300, 304], [300, 303], [300, 302], [299, 302], [298, 302], [297, 301], [296, 301], [295, 301], [291, 301], [288, 301], [280, 301], [276, 301], [268, 301], [256, 301], [252, 301], [242, 302], [239, 303], [225, 303], [221, 303], [213, 303], [208, 303], [203, 303], [196, 303], [193, 303], [187, 303], [186, 303], [184, 303], [182, 303], [181, 303], [179, 303], [178, 303], [175, 303], [174, 303], [173, 303], [172, 303]]
		],
		"x": [
			[[288, 95], [289, 96], [299, 104], [309, 113], [320, 128], [325, 134], [330, 141], [335, 145], [336, 145], [338, 145], [338, 143], [339, 142], [340, 138], [341, 128], [341, 121], [343, 111], [344, 99], [345, 83], [345, 78], [345, 72], [345, 71], [345, 72], [345, 75], [344, 77], [340, 84], [332, 93], [322, 107], [310, 115], [308, 122], [298, 128], [292, 135], [285, 141], [283, 143], [281, 146], [280, 148]],
			[[234, 121], [234, 122], [235, 124], [238, 128], [247, 141], [251, 146], [260, 159], [265, 165], [274, 179], [280, 184], [282, 186], [288, 190], [289, 190], [290, 190], [290, 189], [290, 187], [291, 184], [294, 178], [294, 166], [296, 157], [296, 149], [300, 136], [300, 133], [300, 126], [300, 124], [300, 122], [300, 121], [299, 123], [296, 125], [293, 127], [288, 132], [285, 136], [273, 147], [255, 160], [247, 166], [236, 179], [231, 183], [228, 190], [227, 190], [225, 193]]
		],
		"circle": [
			[[206, 304], [204, 305], [202, 306], [201, 308], [199, 315], [197, 322], [195, 335], [194, 341], [194, 349], [194, 356], [194, 359], [197, 361], [197, 363], [203, 368], [208, 369], [211, 370], [218, 370], [220, 371], [227, 371], [232, 371], [241, 369], [247, 366], [253, 359], [254, 357], [258, 351], [265, 343], [266, 341], [267, 339], [267, 337], [267, 335], [267, 332], [266, 328], [262, 321], [262, 318], [259, 314], [256, 312], [250, 311], [248, 308], [242, 307], [237, 305], [235, 305], [230, 304], [226, 304], [217, 305], [214, 305], [211, 307], [210, 308], [210, 309]],
			[[272, 130], [268, 134], [264, 140], [263, 144], [258, 152], [255, 159], [254, 162], [254, 168], [254, 172], [258, 182], [258, 189], [261, 193], [268, 199], [271, 200], [282, 204], [286, 204], [297, 204], [300, 204], [307, 204], [313, 204], [318, 200], [321, 200], [323, 198], [325, 195], [326, 193], [328, 186], [328, 184], [329, 178], [329, 175], [329, 170], [329, 167], [329, 165], [328, 161], [326, 157], [326, 151], [324, 149], [322, 147], [317, 142], [316, 140], [315, 139], [312, 137], [308, 135], [306, 134], [300, 133], [298, 132], [290, 130], [287, 130], [282, 128], [279, 128], [278, 128], [277, 130], [277, 131], [277, 132]]
		],
		"v": [
			[[232, 352], [238, 361], [242, 368], [246, 380], [250, 384], [252, 391], [253, 393], [254, 397], [255, 397], [255, 396], [255, 395], [256, 393], [257, 389], [259, 383], [261, 378], [263, 372], [264, 370], [266, 364], [266, 362], [268, 359], [268, 357], [270, 355], [270, 353], [271, 352], [271, 351], [272, 350], [272, 347], [273, 347], [273, 346]],
			[[190, 102], [195, 112], [211, 145], [223, 175], [228, 187], [231, 196], [234, 199], [236, 199], [236, 197], [237, 196], [239, 193], [244, 181], [246, 177], [250, 166], [253, 163], [259, 150], [260, 144], [264, 131], [268, 125], [274, 116], [276, 101], [280, 97], [283, 88], [283, 87]]
		],
		"zigzag": [
			[[180, 369], [180, 367], [180, 365], [186, 343], [189, 336], [197, 320], [199, 312], [205, 299], [208, 292], [209, 292], [211, 291], [211, 290], [212, 291], [213, 292], [215, 294], [222, 300], [227, 308], [250, 331], [257, 350], [267, 371], [272, 373], [280, 380], [283, 383], [284, 384], [285, 385], [285, 384], [286, 384], [286, 382], [288, 374], [292, 359], [294, 353], [298, 342], [300, 330], [305, 318], [306, 315], [309, 307], [313, 301], [314, 298], [315, 295], [316, 295], [316, 293], [316, 292], [317, 292]],
			[[168, 212], [168, 211], [168, 209], [168, 208], [168, 207], [169, 204], [170, 201], [172, 196], [173, 190], [174, 188], [177, 181], [178, 180], [179, 176], [181, 174], [182, 171], [183, 169], [185, 169], [188, 162], [190, 160], [190, 159], [191, 159], [192, 159], [193, 159], [194, 159], [195, 160], [197, 162], [199, 164], [203, 168], [205, 170], [207, 172], [209, 174], [211, 177], [215, 181], [216, 183], [218, 187], [221, 189], [227, 196], [229, 198], [235, 203], [236, 205], [239, 207], [241, 207], [241, 209], [243, 210], [244, 210], [245, 210], [246, 210], [248, 207], [249, 205], [250, 201], [251, 199], [256, 191], [257, 188], [259, 182], [260, 179], [261, 175], [262, 173], [265, 168], [266, 165], [266, 163], [268, 158], [269, 156], [272, 152], [273, 151], [273, 150], [274, 149], [275, 148]]
		]

	};
	export var game: Phaser.Game;
	export function normalizePointName(points): { x: number, y: number }[] {
		let npoints: { x: number, y: number }[] = [];
		for (let p of points) {
			npoints.push({
				x: p.hasOwnProperty('X') ? p.X : p.x,
				y: p.hasOwnProperty('Y') ? p.Y : p.y
			});
		}
		return npoints;
	}
	export function topZIndex() {
		return ArrayUtils.of(GameModule.currentScene.children.list).maxValue((c) => c.depth) + 1;
	}
	export function lowZIndex() {
		return ArrayUtils.of(GameModule.currentScene.children.list).minValue((c) => c.depth) - 1;
	}
}
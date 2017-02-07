module bo.designerTools {
	export class ImageFactory implements ToolFactory {
		public width: number;
		public height: number;

		private button: JQuery;
		private counter: number;
		private data: any;

		constructor() {
			this.button = $("<button></button>").append($("<span></span>").addClass("glyphicon glyphicon-picture"));
		}

		public object(x: number, y: number, width: number, height: number): bo.designerTools.Tool {
			this.button.removeClass("active");

			return this.internalObject(x, y, width, height, null);
		}

		public activateTool(): void {
			this.button.addClass("active");
		}

		public deactivateTool(): void {
			this.button.removeClass("active");
		}

		public activate(toolbar: ToolsWindow) {
			this.data = null;
			let self = this;

			// Open up a dialog to get the image
			let toolbarCopy = toolbar;
			let dialogBody = $("<div></div>").addClass("modal-body");
			let dialog = $("<div></div>").addClass("modal fade").prop("tabindex", -1).prop("role", "dialog")
				.append($("<div></div>").addClass("modal-dialog")
					.append($("<div></div>").addClass("modal-content")
						.append($("<div></div>").addClass("modal-header")
							.append($("<button></button>").prop("type", "button").addClass("close")
								.on("click", () => {
									(dialog as any).modal("hide");
								})
								.append($("<span></span>").html("&times;")))
							.append($("<h4></h4>").addClass("modal-title").html("Add Image")))
						.append(dialogBody)
						.append($("<div></div>").addClass("modal-footer")
							.append($("<button></button>").prop("type", "button").addClass("btn btn-default").html("Close")
								.on("click", () => {
									(dialog as any).modal("hide");
								}))
							.append($("<button></button>").prop("type", "button").addClass("btn btn-default").html("Add")
								.on("click", () => {
									toolbarCopy.designer.addObject(self.internalObject(0, 0, self.width, self.height, self.data));
									(dialog as any).modal("hide");
								}))))) as any;

			let imageLeft = null;
			let imageRight = null;
			let imageFile = $("<input type=\"file\" />").css({ width: 400 })
				.on("change", function () {
					let input = imageFile[0] as any;
					if (!input.files[0]) {
						alert("Please select a file to insert.");
					} else {
						let file = input.files[0];
						let reader = new FileReader();
						let insertImg = imageLeft as any;
						let canvasResult = imageRight;
						reader.onloadend = function () {
							let canvas = canvasResult as any;
							let imgSelf = insertImg as any;
							insertImg.css({ "width": "auto", "height": "auto", "max-width": 200, "max-height": 200 });
							canvas.css({ "width": "auto", "height": "auto" });
							insertImg[0].onload = function () {
								let tCanvas = $("<canvas />") as any;
								tCanvas[0].width = imgSelf[0].width;
								tCanvas[0].height = imgSelf[0].height;
								canvas[0].width = imgSelf[0].width;
								canvas[0].height = imgSelf[0].height;
								let tctx = tCanvas[0].getContext("2d");
								let ctx = canvas[0].getContext("2d");
								tctx.drawImage(imgSelf[0], 0, 0, tCanvas[0].width, tCanvas[0].height);
								let tImgData = tctx.getImageData(0, 0, tCanvas[0].width, tCanvas[0].height);
								let imgData = ctx.getImageData(0, 0, tCanvas[0].width, tCanvas[0].height);

								// Convert the canvas data to GRF.
								for (let y = 0; y < tCanvas[0].height; y++) {
									for (let x = 0; x < tCanvas[0].width; x++) {
										let pixelStart = 4 * (tCanvas[0].width * y + x);
										let luminance = tImgData.data[pixelStart] * 0.299 + tImgData.data[pixelStart + 1] * 0.587 + tImgData.data[pixelStart + 2] * 0.114;

										if (luminance > 127) {
											imgData.data[pixelStart] = 255;
											imgData.data[pixelStart + 1] = 255;
											imgData.data[pixelStart + 2] = 255;
											imgData.data[pixelStart + 3] = 255;
										} else {
											imgData.data[pixelStart] = 0;
											imgData.data[pixelStart + 1] = 0;
											imgData.data[pixelStart + 2] = 0;
											imgData.data[pixelStart + 3] = 255;
										}
									}
								}
								self.width = canvas[0].width;
								self.height = canvas[0].height;
								self.data = imgData.data;

								ctx.putImageData(imgData, 0, 0);
							};
							insertImg[0].src = reader.result;
						};
						reader.readAsDataURL(file);
					}
				}).appendTo(dialogBody);
			let imageContainer = $("<div></div>").css({ "padding-top": "5px" });
			imageLeft = $("<img />").prop("src", "images/blank.png").prop("border", "none").css({ border: "1px solid #DDDDDD", float: "left", height: 200, width: 200 }).appendTo(imageContainer);
			imageRight = $("<canvas />").css({ border: "1px solid #DDDDDD", float: "right", height: 200, width: 200 }).appendTo(imageContainer);
			$("<br style='clear:both'></br>").appendTo(imageContainer);

			imageContainer.appendTo(dialogBody);

			dialog.modal("show")
				.on("hidden.bs.modal", { toolbar: toolbar }, function (event) {
					event.data.toolbar.setTool(null);
				});
		};
		private internalObject(x: number, y: number, width: number, height: number, data: any): Tool {
			this.counter = this.counter || 1;
			let result = new ImageTool(this.counter++, x, y, width, height);
			result.data = data;
			return result;
		}
	}

	export class ImageTool implements Tool {
		public name: string;
		public x: number;
		public y: number;
		public width: number;
		public height: number;
		public data: any;
		public rotation: number;
		public canResize: boolean;
		public properties: any;
		public uniqueID: number;

        public static fromObject(object: any) {
			let result = new ImageTool(object.uniqueID, object.x, object.y, object.width, object.height);
			result.data = object.data;
			result.name = object.name;

			return result;
		}

		constructor(counter: number, x: number, y: number, width: number, height: number) {
			this.uniqueID = counter;
			this.name = "Image " + counter;
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height; x;
			this.rotation = 0;
			this.canResize = true;

			this.properties = [
				{
					name: "name", text: "name", readonly: false, type: "text"
					, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; },
				},
				{
					name: "x", text: "x", readonly: false, type: "number"
					, get: function (obj) { return obj.x; }, set: function (obj, value) { obj.x = value; },
				},
				{
					name: "y", text: "y", readonly: false, type: "number"
					, get: function (obj) { return obj.y; }, set: function (obj, value) { obj.y = value; },
				},
				{
					name: "width", text: "width", readonly: true, type: "text"
					, get: function (obj) { return obj.width; }, set: function (obj, value) { obj.width = value; },
				},
				{
					name: "height", text: "height", readonly: true, type: "text"
					, get: function (obj) { return obj.height; }, set: function (obj, value) { obj.height = value; },
				},
			];
		}

		public draw(context: any, width: number, height: number) {
			let ctxData = context.getImageData(0, 0, width, height);
			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
					if (this.x + x >= 0 && this.x + x < width
						&& this.y + y >= 0 && this.y + y < height) {
						let drawPoint = 4 * (width * (this.y + y) + this.x + x);
						let drawFromPoint = 4 * (this.width * y + x);
						ctxData.data[drawPoint] = this.data[drawFromPoint];
						ctxData.data[drawPoint + 1] = this.data[drawFromPoint + 1];
						ctxData.data[drawPoint + 2] = this.data[drawFromPoint + 2];
						ctxData.data[drawPoint + 3] = this.data[drawFromPoint + 3];
					}
				}
			}

			context.putImageData(ctxData, 0, 0);
		}

		public drawActive(context: any) {
			context.dashedStroke((this.x - 5), (this.y - 5), (this.x) + (this.width) + 5, (this.y) + (this.height) + 5, [2, 2]);
		}

		public hitTest(coords: any) {
			return (coords.x >= (this.x) && coords.x <= (this.x) + (this.width) && coords.y >= (this.y) && coords.y <= (this.y) + (this.height));
		}

        public toSerializable(): any {
			return {
				data: this.data, height: this.height, name: this.name, type: "imageTool", uniqueID: this.uniqueID, width: this.width, x: this.x, y: this.y,
			};
		}
		
		public getZplData(): string {
			let GRFVal = function(nibble: string): string {
				let nibbleMap = { 
					"0" : "0000",
					"1" : "0001",
					"2" : "0010",
					"3" : "0011",
					"4" : "0100",
					"5" : "0101",
					"6" : "0110",
					"7" : "0111",
					"8" : "1000",
					"9" : "1001",
					"A" : "1010",
					"B" : "1011",
					"C" : "1100",
					"D" : "1101",
					"E" : "1110",
					"F" : "1111",
				};
				
				for (let key in nibbleMap) {
					if (nibbleMap[key] == nibble) {
						return key;
					}
				}
				
				return "";
			}
			
			let imgData = "";
			let bytesPerLine = Math.ceil(this.width / 8);
			console.log(bytesPerLine);
			console.log(this.width);
			console.log(bytesPerLine);
			for (let y = 0; y < this.height; y++) {
				let nibble = "";
				let bytes = 0;
				for (let x = 0; x < this.width; x++) {
					let point = 4 * (this.width * y + x);
					if (this.data[point+1] == 0) {
						nibble += "1";
					}
					else nibble += "0";
					
					if (nibble.length > 7) {
						imgData += GRFVal(nibble.substring(0, 4)) + GRFVal(nibble.substring(4, 8));
						nibble = "";
						bytes++;
					}
				}
				
				if (nibble.length > 0) {
					while (nibble.length < 8) nibble += "0";
					imgData += GRFVal(nibble.substring(0, 4)) + GRFVal(nibble.substring(4, 8));
					nibble = "";
					bytes++;
				}
				
				while (bytes < bytesPerLine) {
					imgData += GRFVal("0000") + GRFVal("0000");
					bytes++;
				}
				
				imgData += "\n";
			}
			
			return "~DGIMG" + this.uniqueID + "," + bytesPerLine * this.height + "," + bytesPerLine + "," + imgData;
		}
		
		public toZpl(labelx: number, labely: number, labelwidth: number, labelheight: number): string {
			return "^FO" + (this.x - labelx) + "," + (this.y - labely) + "^XGR:IMG" + this.uniqueID + ",1,1^FS";
		}

	}
}

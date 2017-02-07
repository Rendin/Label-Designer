module bo.helpers {

    export class GenerateZplControl {
        private workspace: JQuery;
        private generateZplController: JQuery;

        constructor(public designer: LabelDesigner) {
            this.workspace = this.buildWorkspace();
            this.generateZplController = this.buildGenerateZplController(designer);
        }

        private buildWorkspace(): JQuery {
            return $("<div></div>").addClass("label-toolbar-group").attr("title", "Generate ZPL");
        }

        private buildGenerateZplController(designer: LabelDesigner): JQuery {
            let container = $("<div></div>").addClass("label-size-element").appendTo(this.workspace);
            return $("<button><span class='.btn'>Generate ZPL</span></button>")
                .addClass("btn btn-default")
                .appendTo(container)
                .on("click", (e) => {
                    e.preventDefault();
                    let zpl = designer.generateZpl();
                    let dialog = $("<div></div>").prop("title", "Generated ZPL");
                    
                    let output = $("<textarea></textarea>").css({ "white-space": "nowrap", resize: "none", width: "100%", height: "100%" }).val(zpl.data + zpl.zpl).appendTo(dialog);
                    
                    let Toolbar = toolbar;
                    dialog.dialog({
                        modal : true,
                        width : 470,
                        height : 400
                    });
                    
                    output.select();
                    //window.saveAs(new File([designer.saveToJson()], "label.json"));
                });
        }

        // private buildFileInput(designer: LabelDesigner): JQuery {
        //     return $("<input type=\"file\" />")
        //         .on("change", () => {
        //             let input = this.fileInput[0] as any;
        //             if (input.files[0]) {
        //                 let file = input.files[0];
        //                 let reader = new FileReader();
        //                 reader.onloadend = () => {
        //                     designer.loadFromJson(reader.result);
        //                 };
        //                 reader.readAsText(file);
        //             }
        //         });
        // }
    }
}

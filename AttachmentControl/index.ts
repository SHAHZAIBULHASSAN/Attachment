import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class AttachmentControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private fileInput: HTMLInputElement;
    private previewContainer: HTMLDivElement;
    private notifyOutputChanged: () => void;
    private fileBase64List: { name: string; data: string }[] = []; // List of uploaded files (name + base64)

    private readonly maxFileSizeMB: number = 5; // Maximum file size in MB
    private readonly acceptedFileTypes: string[] = ["image/", "application/pdf", "text/"]; // Allowed file types

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;

        // Initialize the UI
        this.createUI();
    }

    private createUI(): void {
        // File input (hidden, allows multiple files)
        this.fileInput = document.createElement("input");
        this.fileInput.type = "file";
        this.fileInput.accept = this.acceptedFileTypes.join(","); // Allowed file types
        this.fileInput.style.display = "none";
        this.fileInput.multiple = true; // Allow multiple files
        this.fileInput.onchange = this.handleFileUpload.bind(this);

        // Upload icon
        const uploadIcon = this.createUploadIcon();
        uploadIcon.onclick = () => this.fileInput.click();

        // Drag-and-drop area
        const dragDropArea = this.createDragDropArea();

        // Preview container
        this.previewContainer = document.createElement("div");
        this.previewContainer.style.border = "1px solid #ddd";
        this.previewContainer.style.padding = "10px";
        this.previewContainer.style.marginTop = "10px";
        this.previewContainer.textContent = "No files uploaded.";

        // Append elements to the container
        this.container.appendChild(uploadIcon);
        this.container.appendChild(dragDropArea);
        this.container.appendChild(this.fileInput);
        this.container.appendChild(this.previewContainer);
    }

    private createUploadIcon(): HTMLDivElement {
        const uploadIcon = document.createElement("div");
        uploadIcon.textContent = "📤 Upload Files";
        uploadIcon.style.cursor = "pointer";
        uploadIcon.style.padding = "10px";
        uploadIcon.style.border = "1px solid #ccc";
        uploadIcon.style.textAlign = "center";
        uploadIcon.style.marginBottom = "10px";
        uploadIcon.style.backgroundColor = "#f8f8f8";
        uploadIcon.style.borderRadius = "5px";
        uploadIcon.style.fontWeight = "bold";
        return uploadIcon;
    }

    private createDragDropArea(): HTMLDivElement {
        const dragDropArea = document.createElement("div");
        dragDropArea.textContent = "Drag and drop your files here.";
        dragDropArea.style.border = "2px dashed #ccc";
        dragDropArea.style.padding = "20px";
        dragDropArea.style.textAlign = "center";
        dragDropArea.style.marginTop = "10px";
        dragDropArea.style.borderRadius = "5px";
        dragDropArea.style.fontStyle = "italic";
        dragDropArea.ondragover = (event) => {
            event.preventDefault();
            dragDropArea.style.borderColor = "#0078d4";
        };
        dragDropArea.ondragleave = () => {
            dragDropArea.style.borderColor = "#ccc";
        };
        dragDropArea.ondrop = (event) => {
            event.preventDefault();
            dragDropArea.style.borderColor = "#ccc";
            const files = event.dataTransfer?.files;
            if (files) {
                Array.from(files).forEach((file) => this.processFile(file));
            }
        };
        return dragDropArea;
    }

    private handleFileUpload(event: Event): void {
        const files = (event.target as HTMLInputElement).files;
        if (files) {
            Array.from(files).forEach((file) => this.processFile(file));
        }
    }

    private processFile(file: File): void {
        if (!this.validateFile(file)) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const fileData = reader.result as string;
            this.fileBase64List.push({ name: file.name, data: fileData });
            this.notifyOutputChanged();
            this.displayPreviews();
        };
        reader.readAsDataURL(file); // Convert file to Base64
    }

    private validateFile(file: File): boolean {
        // Check file size
        const maxSizeBytes = this.maxFileSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            alert(`File "${file.name}" exceeds the ${this.maxFileSizeMB} MB size limit.`);
            return false;
        }

        // Check file type
        if (!this.acceptedFileTypes.some((type) => file.type.startsWith(type))) {
            alert(`Unsupported file type for "${file.name}". Please upload a valid file.`);
            return false;
        }

        return true;
    }

    private displayPreviews(): void {
        this.previewContainer.innerHTML = ""; // Clear previous previews

        if (this.fileBase64List.length === 0) {
            this.previewContainer.textContent = "No files uploaded.";
            return;
        }

        this.fileBase64List.forEach((file, index) => {
            const fileContainer = document.createElement("div");
            fileContainer.style.marginBottom = "10px";

            const fileLabel = document.createElement("p");
            fileLabel.textContent = `File ${index + 1}: ${file.name}`;

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.style.marginLeft = "10px";
            removeButton.onclick = () => this.removeFile(index);

            fileContainer.appendChild(fileLabel);
            fileContainer.appendChild(removeButton);

            if (file.data.startsWith("data:image/")) {
                const img = document.createElement("img");
                img.src = file.data;
                img.style.maxWidth = "100%";
                fileContainer.appendChild(img);
            } else if (file.data.startsWith("data:application/pdf")) {
                const iframe = document.createElement("iframe");
                iframe.src = file.data;
                iframe.style.width = "100%";
                iframe.style.height = "200px";
                fileContainer.appendChild(iframe);
            } else if (file.data.startsWith("data:text/")) {
                const textArea = document.createElement("textarea");
                textArea.value = atob(file.data.split(",")[1]); // Decode Base64
                textArea.readOnly = true;
                textArea.style.width = "100%";
                textArea.style.height = "100px";
                fileContainer.appendChild(textArea);
            }

            this.previewContainer.appendChild(fileContainer);
        });
    }

    private removeFile(index: number): void {
        this.fileBase64List.splice(index, 1); // Remove the file from the list
        this.notifyOutputChanged();
        this.displayPreviews();
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Update the view when bound data changes
    }

    public getOutputs(): IOutputs {
        return { uploadedFile: JSON.stringify(this.fileBase64List) }; // Return files as a JSON string
    }

    public destroy(): void {
        // Cleanup if necessary
    }
}

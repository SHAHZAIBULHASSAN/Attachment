The AttachmentControl component is a PowerApps Component Framework (PCF) control designed for handling file uploads. It supports multiple file uploads, drag-and-drop functionality, file previews, and base64 encoding for easy data handling.

Features
Supports multiple file uploads

Drag-and-drop functionality

File type and size validation

Base64 conversion for uploaded files

Preview support for images, PDFs, and text files

File removal functionality

Code Breakdown
Importing Dependencies
import { IInputs, IOutputs } from "./generated/ManifestTypes";
The component imports IInputs and IOutputs from the generated manifest file to define the control's input and output types.

Component Definition
export class AttachmentControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
Defines the AttachmentControl class, implementing the StandardControl interface from PCF.

Class Variables
private container: HTMLDivElement;
private fileInput: HTMLInputElement;
private previewContainer: HTMLDivElement;
private notifyOutputChanged: () => void;
private fileBase64List: { name: string; data: string }[] = []; // List of uploaded files (name + base64)

private readonly maxFileSizeMB: number = 5;
private readonly acceptedFileTypes: string[] = ["image/", "application/pdf", "text/"];
container: Holds the UI elements.

fileInput: Hidden file input for selecting files manually.

previewContainer: Displays uploaded file previews.

notifyOutputChanged: Callback function to notify PowerApps about data updates.

fileBase64List: Stores uploaded files with their names and base64-encoded content.

maxFileSizeMB: Defines the maximum allowed file size (5MB).

acceptedFileTypes: Specifies allowed file types (images, PDFs, and text files).

init Method
public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
): void {
    this.container = container;
    this.notifyOutputChanged = notifyOutputChanged;
    this.createUI();
}
Initializes the component.

Stores the container and notifyOutputChanged reference.

Calls createUI to render UI elements.

UI Creation
File Input (Hidden)
this.fileInput = document.createElement("input");
this.fileInput.type = "file";
this.fileInput.accept = this.acceptedFileTypes.join(",");
this.fileInput.style.display = "none";
this.fileInput.multiple = true;
this.fileInput.onchange = this.handleFileUpload.bind(this);
Creates a hidden <input> element for file selection.

Supports multiple files.

Triggers handleFileUpload when files are selected.

Upload Icon
const uploadIcon = this.createUploadIcon();
uploadIcon.onclick = () => this.fileInput.click();
Creates an upload button that triggers the file input on click.

Drag-and-Drop Area
const dragDropArea = this.createDragDropArea();
Initializes the drag-and-drop file upload area.

Preview Container
this.previewContainer = document.createElement("div");
this.previewContainer.style.border = "1px solid #ddd";
this.previewContainer.style.padding = "10px";
this.previewContainer.style.marginTop = "10px";
this.previewContainer.textContent = "No files uploaded.";
Creates a container to display uploaded files.

Handling File Uploads
handleFileUpload
private handleFileUpload(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
        Array.from(files).forEach((file) => this.processFile(file));
    }
}
Retrieves selected files and processes each one.

processFile
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
    reader.readAsDataURL(file);
}
Validates file type and size.

Reads the file and converts it to base64.

Adds file to fileBase64List.

Updates the UI.

File Validation
private validateFile(file: File): boolean {
    const maxSizeBytes = this.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        alert(`File "${file.name}" exceeds the ${this.maxFileSizeMB} MB size limit.`);
        return false;
    }

    if (!this.acceptedFileTypes.some((type) => file.type.startsWith(type))) {
        alert(`Unsupported file type for "${file.name}".`);
        return false;
    }
    return true;
}
Ensures the file does not exceed the size limit.

Checks that the file type is supported.

Displaying Previews
private displayPreviews(): void {
    this.previewContainer.innerHTML = "";

    if (this.fileBase64List.length === 0) {
        this.previewContainer.textContent = "No files uploaded.";
        return;
    }

    this.fileBase64List.forEach((file, index) => {
        const fileContainer = document.createElement("div");
        fileContainer.style.marginBottom = "10px";

        const fileLabel = document.createElement("p");
        fileLabel.textContent = `File ${index + 1}: ${file.name}`;
        fileContainer.appendChild(fileLabel);

        if (file.data.startsWith("data:image/")) {
            const img = document.createElement("img");
            img.src = file.data;
            img.style.maxWidth = "100%";
            fileContainer.appendChild(img);
        }
        this.previewContainer.appendChild(fileContainer);
    });
}
Clears previous previews.

Displays uploaded files with appropriate previews (images, text, PDF previews).

Removing Files
private removeFile(index: number): void {
    this.fileBase64List.splice(index, 1);
    this.notifyOutputChanged();
    this.displayPreviews();
}
Removes a file from the list.

Updates the UI.

Output Handling
public getOutputs(): IOutputs {
    return { uploadedFile: JSON.stringify(this.fileBase64List) };
}
Returns the list of uploaded files as a JSON string.

Cleanup
public destroy(): void {
    // Cleanup if necessary
}
Placeholder for cleanup logic.

Conclusion
This AttachmentControl PCF component provides a robust file upload solution with UI enhancements, validation, and base64 conversion. It is well-suited for PowerApps applications requiring file handling capabilities.



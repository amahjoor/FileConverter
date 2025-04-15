document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('pptFile');
  const fileNameSpan = document.querySelector('.file-name');
  const convertBtn = document.getElementById('convertBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const resultContainer = document.getElementById('resultContainer');
  const downloadLinks = document.getElementById('downloadLinks');
  const errorContainer = document.getElementById('errorContainer');
  const errorMessage = document.getElementById('errorMessage');
  const statusText = document.getElementById('statusText');

  // Handle file selection
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      const fileCount = fileInput.files.length;
      if (fileCount === 1) {
        fileNameSpan.textContent = fileInput.files[0].name;
      } else {
        fileNameSpan.textContent = `${fileCount} files selected`;
      }
      convertBtn.disabled = false;
    } else {
      fileNameSpan.textContent = 'No files chosen';
      convertBtn.disabled = true;
    }
  });

  // Handle form submission
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset UI
    hideElement(resultContainer);
    hideElement(errorContainer);
    showElement(progressContainer);
    progressBar.style.width = '0%';
    statusText.textContent = 'Uploading...';
    
    // Clear previous download links
    downloadLinks.innerHTML = '';

    // Create form data
    const formData = new FormData();
    const files = fileInput.files;
    
    // Check if multiple files are selected
    if (files.length > 1) {
      // Add multiple files to form data
      for (let i = 0; i < files.length; i++) {
        formData.append('pptFiles', files[i]);
      }
      
      try {
        // Simulate progress
        simulateProgress();

        // Send the files for conversion
        const response = await fetch('/convert-multiple', {
          method: 'POST',
          body: formData
        });

        // Complete progress
        progressBar.style.width = '100%';
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Show result
        statusText.textContent = 'Conversion complete!';
        
        setTimeout(() => {
          hideElement(progressContainer);
          showElement(resultContainer);
          
          // Create download links for each converted file
          data.results.forEach(result => {
            if (result.downloadLink) {
              const linkContainer = document.createElement('div');
              linkContainer.className = 'download-item';
              
              const fileNameSpan = document.createElement('span');
              fileNameSpan.className = 'file-result-name';
              fileNameSpan.textContent = result.originalName;
              
              const link = document.createElement('a');
              link.href = result.downloadLink;
              link.className = 'download-btn';
              link.textContent = 'Download PDF';
              link.download = result.originalName.replace(/\.[^/.]+$/, '') + '.pdf';
              
              linkContainer.appendChild(fileNameSpan);
              linkContainer.appendChild(link);
              downloadLinks.appendChild(linkContainer);
            } else if (result.error) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'file-error';
              errorDiv.textContent = `${result.originalName}: ${result.error}`;
              downloadLinks.appendChild(errorDiv);
            }
          });
        }, 500);
      } catch (error) {
        console.error('Error:', error);
        hideElement(progressContainer);
        showElement(errorContainer);
        errorMessage.textContent = 'Failed to convert files. Please try again.';
      }
    } else if (files.length === 1) {
      // Single file upload
      formData.append('pptFile', files[0]);
      
      try {
        // Simulate progress
        simulateProgress();

        // Send the file for conversion
        const response = await fetch('/convert', {
          method: 'POST',
          body: formData
        });

        // Complete progress
        progressBar.style.width = '100%';
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Show result
        statusText.textContent = 'Conversion complete!';
        
        setTimeout(() => {
          hideElement(progressContainer);
          showElement(resultContainer);
          
          const linkContainer = document.createElement('div');
          linkContainer.className = 'download-item';
          
          const fileNameSpan = document.createElement('span');
          fileNameSpan.className = 'file-result-name';
          fileNameSpan.textContent = files[0].name;
          
          const link = document.createElement('a');
          link.href = data.downloadLink;
          link.className = 'download-btn';
          link.textContent = 'Download PDF';
          link.download = files[0].name.replace(/\.[^/.]+$/, '') + '.pdf';
          
          linkContainer.appendChild(fileNameSpan);
          linkContainer.appendChild(link);
          downloadLinks.appendChild(linkContainer);
        }, 500);
      } catch (error) {
        console.error('Error:', error);
        hideElement(progressContainer);
        showElement(errorContainer);
        errorMessage.textContent = 'Failed to convert file. Please try again.';
      }
    }
  });

  // Utility functions
  function showElement(element) {
    element.classList.remove('hidden');
  }

  function hideElement(element) {
    element.classList.add('hidden');
  }

  function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 90) {
        clearInterval(interval);
        progress = 90;
        statusText.textContent = 'Almost there...';
      }
      progressBar.style.width = `${progress}%`;
    }, 500);
  }
}); 
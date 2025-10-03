document.addEventListener("DOMContentLoaded", () => {
  // Dropdown toggle for "Go to Meetings"
  
  const goToMeetingsBtn = document.querySelector(".main-btn:nth-child(2)");
  const dropdown = document.getElementById("meetingDropdown");

  if (goToMeetingsBtn && dropdown) {
    goToMeetingsBtn.addEventListener("click", () => {
      dropdown.classList.toggle("hidden");
    });
  }

  // Transcript upload and processing
  const form = document.getElementById("uploadForm");
  const fileInput = document.getElementById("audioFile");
  const loader = document.getElementById("loader");
  const transcriptBox = document.getElementById("transcriptBox");
  const textarea = transcriptBox?.querySelector("textarea");

  if (form && fileInput && loader && transcriptBox && textarea) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const file = fileInput.files[0];
      if (!file) return alert("Please select an audio file.");

      loader.classList.remove("hidden");

      try {
        // Step 1: Upload audio to AssemblyAI
        const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
          method: "POST",
          headers: {
            "authorization": "87c451621c5d45ac8e2ca5df9db3f499"
          },
          body: file
        });

        const uploadData = await uploadResponse.json();
        const audioUrl = uploadData.upload_url;

        // Step 2: Request transcription
        const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
          method: "POST",
          headers: {
            "authorization": "87c451621c5d45ac8e2ca5df9db3f499",
            "content-type": "application/json"
          },
          body: JSON.stringify({ audio_url: audioUrl })
        });

        const transcriptData = await transcriptResponse.json();
        const transcriptId = transcriptData.id;

        // Step 3: Poll for completion
        let completed = false;
        let transcriptText = "";

        while (!completed) {
          const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
            headers: { "authorization": "87c451621c5d45ac8e2ca5df9db3f499" }
          });

          const pollingData = await pollingResponse.json();

          if (pollingData.status === "completed") {
            completed = true;
            transcriptText = pollingData.text;
          } else if (pollingData.status === "error") {
            loader.classList.add("hidden");
            return alert("Transcription failed.");
          } else {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }

        // Step 4: Display transcript
        loader.classList.add("hidden");
        transcriptBox.classList.remove("hidden");
        textarea.value = transcriptText;

      } catch (error) {
        loader.classList.add("hidden");
        alert("Something went wrong. Please try again.");
        console.error(error);
      }
    });
  }
});



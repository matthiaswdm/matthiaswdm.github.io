document.addEventListener('DOMContentLoaded', function () {
    // Add event listeners for each select element
    const select1 = document.getElementById('selectedTalk1');
    const select2 = document.getElementById('selectedTalk2');
    const select3 = document.getElementById('selectedTalk3');

    select1.addEventListener('change', function () {
        handleSelectChange(select1, select2, select3);
    });

    select2.addEventListener('change', function () {
        handleSelectChange(select2, select1, select3);
    });

    select3.addEventListener('change', function () {
        handleSelectChange(select3, select1, select2);
    });
});

let disableOptionsArray = [];
const errorMsg = document.getElementById("errorMessage");
const errorImg = document.createElement('img');
errorImg.src = '/img/red-alert-icon.png';
errorImg.style.width = '5%';
errorImg.style.height = '5%';
errorImg.style.marginTop = "0.5vh";

function handleSelectChange(changedSelect, otherSelect1, otherSelect2) {
    // Get the selected value from the changed select element
    const selectedValue = changedSelect.value;

    disableOptionsArray.push(selectedValue)
    reverseNotSelectedOptionsInArray(changedSelect, otherSelect1, otherSelect2)

    // Disable the selected option in the other select element
    disableOption(otherSelect1);
    disableOption(otherSelect2);
}

function reverseNotSelectedOptionsInArray(select1, select2, select3) {
    select1Value = select1.value;
    select2Value = select2.value;
    select3Value = select3.value;
    for (let index = 0; index < disableOptionsArray.length; index++) {
        if (disableOptionsArray[index] !== select1Value && disableOptionsArray[index] !== select2Value && disableOptionsArray[index] !== select3Value) {
            disableOptionsArray.splice(index, 1)
        }
    }
}

function disableOption(selectElement) {
    // Enable all options in the select element
    for (let option of selectElement.options) {
        option.disabled = false;
    }

    // Iterate over the array in reverse order and disable options
    for (let index = disableOptionsArray.length - 1; index >= 0; index--) {
        const selectedOption = selectElement.querySelector(`option[value="${disableOptionsArray[index]}"]`);
        if (selectedOption) {
            selectedOption.disabled = true;
        }
    }
}

function submitForm() {
    const fullName = document.getElementById('fullName');
    const selectedTalk1 = document.getElementById('selectedTalk1');
    const selectedTalk2 = document.getElementById('selectedTalk2');
    const selectedTalk3 = document.getElementById('selectedTalk3');

    errorMsg.innerHTML = '';

    // console.log(`Name: ${fullName}, Selected Talks: ${selectedTalk1}, ${selectedTalk2}, ${selectedTalk3}`);
    if (!fullName.value || !selectedTalk1.value || !selectedTalk2.value || !selectedTalk3.value) {
        errorMsg.style.display = "block";

        const errorContainer = document.createElement('div');
        errorContainer.style.display = "flex";
        errorContainer.appendChild(errorImg);

        const errorText = document.createElement('p');
        errorText.innerHTML = "Bitte füllen sie alle Felder aus.";
        errorText.style.marginLeft = "0.5vw";
        errorContainer.appendChild(errorText);

        errorMsg.appendChild(errorContainer);
        if (fullName.value == '') {
            fullName.classList.add("errorBorder");
            selectedTalk1.classList.remove("errorBorder");
            selectedTalk2.classList.remove("errorBorder");
            selectedTalk3.classList.remove("errorBorder");
        } else if (selectedTalk1.value == '') {
            selectedTalk1.classList.add("errorBorder");
            fullName.classList.remove("errorBorder");
            selectedTalk2.classList.remove("errorBorder");
            selectedTalk3.classList.remove("errorBorder");
        } else if (selectedTalk2.value == '') {
            selectedTalk2.classList.add("errorBorder");
            fullName.classList.remove("errorBorder");
            selectedTalk1.classList.remove("errorBorder");;
            selectedTalk3.classList.remove("errorBorder");
        } else if (selectedTalk3.value == '') {
            selectedTalk3.classList.add("errorBorder");
            fullName.classList.remove("errorBorder");
            selectedTalk1.classList.remove("errorBorder");
            selectedTalk2.classList.remove("errorBorder");
        };
    } else {
        fullName.classList.remove("errorBorder");
        selectedTalk1.classList.remove("errorBorder");
        selectedTalk2.classList.remove("errorBorder");
        selectedTalk3.classList.remove("errorBorder");
        errorMsg.style.display = "none";
        checkIfExisting();
    }
}
function checkIfExisting() {
    const fullName = document.getElementById('fullName').value;
    const selectedTalk1 = document.getElementById('selectedTalk1').value;
    const selectedTalk2 = document.getElementById('selectedTalk2').value;
    const selectedTalk3 = document.getElementById('selectedTalk3').value;
    let content = [];

    const formData = {
        fullName,
        selectedTalk1,
        selectedTalk2,
        selectedTalk3,
    };

    const apiUrl = 'https://api.github.com/repos/matthiaswdm/matthiaswdm.github.io/contents/stats/submissions.json';
    const accessToken = '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';
    fetchExistingContent()
    .then(existingContent => {
        if (existingContent !== null) {
            console.log('Existing content:', existingContent);
            // You can perform any additional logic with the existing content here
            content = existingContent
            console.log(content)
            content.push(formData)
        }
    });

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('GitHub API response:', data);

            return fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update submissions.json',
                    content: btoa(JSON.stringify(content, null, 2)),
                    sha: data.sha,
                }),
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Form submitted successfully!');
        })
        .catch(error => {
            console.error('Error submitting form:', error);
        });
}
async function fetchExistingContent() {
    const rawUrl = 'https://raw.githubusercontent.com/matthiaswdm/matthiaswdm.github.io/main/stats/submissions.json';

    try {
        const response = await fetch(rawUrl);
        if (!response.ok) {
            throw new Error(`Error fetching submissions.json: ${response.statusText}`);
        }
        const existingContent = await response.json();
        return existingContent;
    } catch (error) {
        console.error('Error fetching existing content:', error);
        return null;
    }
}
/*
// Usage example:
fetchExistingContent()
    .then(existingContent => {
        if (existingContent !== null) {
            console.log('Existing content:', existingContent);
            // You can perform any additional logic with the existing content here
        }
    });

*/
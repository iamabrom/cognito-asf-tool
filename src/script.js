let originalData = null;

        function decodeData(encodedString) {
            try {
                const decoded = JSON.parse(atob(encodedString));
                return decoded;
            } catch (error) {
                console.error('Error decoding:', error);
                return null;
            }
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text)
                .then(() => showCopyNotification())
                .catch(err => console.error('Failed to copy:', err));
        }

        function showCopyNotification() {
            const notif = document.getElementById('copyNotification');
            notif.style.display = 'block';
            setTimeout(() => {
                notif.style.display = 'none';
            }, 2000);
        }

        function populateEditor(decodedData) {
            const contextData = decodedData.payload ? JSON.parse(decodedData.payload).contextData : decodedData.contextData;
            document.getElementById('userAgent').value = contextData.UserAgent || '';
            document.getElementById('deviceId').value = contextData.DeviceId || '';
            document.getElementById('deviceLanguage').value = contextData.DeviceLanguage || '';
            document.getElementById('devicePlatform').value = contextData.DevicePlatform || '';
            document.getElementById('clientTimezone').value = contextData.ClientTimezone || '';
            document.getElementById('timestamp').value = decodedData.payload ?
                JSON.parse(decodedData.payload).timestamp : decodedData.timestamp;
        }

        function generateEncodedData() {
            try {
                const username = document.getElementById('username').value;
                const userPoolId = document.getElementById('userPoolId').value;
                const clientId = document.getElementById('clientId').value;

                if (!username || !userPoolId || !clientId) {
                    throw new Error('All fields are required');
                }

                const encodedData = AmazonCognitoAdvancedSecurityData.getData(
                    username,
                    userPoolId,
                    clientId
                );

                const decodedData = decodeData(encodedData);

                let outputHtml = '<strong>Original Encoded Data:</strong><br><br>' +
                    '<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">' +
                    '<code id="originalEncodedText" style="word-break: break-all; flex: 1;">' + encodedData + '</code>' +
                    '<button onclick="copyToClipboard(document.getElementById(\'originalEncodedText\').innerText)">Copy Encoded Data</button>' +
                    '</div>';

                if (decodedData) {
                    originalData = decodedData;
                    const beautifiedJson = JSON.stringify(decodedData, null, 2);
                    outputHtml += '<br><br><strong>Decoded JSON:</strong><br><br>' +
                        '<pre style="background-color: #383D50; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap;">' +
                        beautifiedJson +
                        '</pre>';

                    document.getElementById('editor').style.display = 'block';
                    populateEditor(decodedData);
                }

                document.getElementById('output').innerHTML = outputHtml;

            } catch (error) {
                document.getElementById('output').innerHTML =
                    '<strong>Error:</strong><br><br>' + error.message;
            }
        }

        function updateEncodedData() {
            if (!originalData) return;

            const updatedContextData = {
                UserAgent: document.getElementById('userAgent').value,
                DeviceId: document.getElementById('deviceId').value,
                DeviceLanguage: document.getElementById('deviceLanguage').value,
                DevicePlatform: document.getElementById('devicePlatform').value,
                ClientTimezone: document.getElementById('clientTimezone').value,
                DeviceFingerprint: originalData.payload ?
                    JSON.parse(originalData.payload).contextData.DeviceFingerprint :
                    originalData.contextData.DeviceFingerprint
            };

            const updatedPayload = {
                contextData: updatedContextData,
                username: document.getElementById('username').value,
                userPoolId: document.getElementById('userPoolId').value,
                timestamp: document.getElementById('timestamp').value
            };

            const newEncodedObject = {
                payload: JSON.stringify(updatedPayload),
                signature: originalData.signature || '',
                version: originalData.version || 'JS20171115'
            };

            const finalEncodedString = btoa(JSON.stringify(newEncodedObject));
            const decodedUpdated = decodeData(finalEncodedString);
            const beautifiedUpdatedJson = JSON.stringify(decodedUpdated, null, 2);

            document.getElementById('updatedOutput').style.display = 'block';
            document.getElementById('updatedOutput').innerHTML =
                '<strong>Updated Encoded Data:</strong><br><br>' +
                '<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">' +
                '<code id="updatedEncodedText" style="word-break: break-all; flex: 1;">' + finalEncodedString + '</code>' + 
                '<button onclick="copyToClipboard(document.getElementById(\'updatedEncodedText\').innerText)">Copy Updated Encoded Data</button>' +
                '</div>' +
                '<br><br><strong>Decoded JSON:</strong><br><br>' +
                '<pre style="background-color: #383D50; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap;">' +
                beautifiedUpdatedJson +
                '</pre>';
        }
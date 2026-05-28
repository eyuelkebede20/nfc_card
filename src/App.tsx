/// <reference types="w3c-web-nfc" />
import { useState, useEffect } from "react";

export default function NfcWebScanner() {
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [tagData, setTagData] = useState({ uid: "", record: "" });

  // 1. Check if the browser supports Web NFC on mount
  useEffect(() => {
    if ("NDEFReader" in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setStatus("Web NFC is not supported on this browser/OS. Please use Chrome on Android.");
    }
  }, []);

  const handleScan = async () => {
    if (!isSupported) return;

    setStatus("Initializing sensor...");
    try {
      // 2. Instantiate the native browser reader
      const ndef = new NDEFReader();

      // Starts the physical hardware loop (triggers the browser permission prompt)
      await ndef.scan();
      setStatus("Approach the tag to the back of your Samsung device...");
      ndef.onreadingerror = () => {
        setStatus("Read error. Try aligning the middle of your phone with the tag.");
      };

      // 3. Destructure with the *correctly spelled* Type Definition
      ndef.onreading = ({ serialNumber, message }: NDEFReadingEvent) => {
        // We will store all discovered data in an array
        const extractedRecords = [];

        // Loop through every record in the message
        message.records.forEach((record, index) => {
          let data = "";

          // Handle different record types
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder(record.encoding || "utf-8");
            data = textDecoder.decode(record.data);
          } else if (record.recordType === "url") {
            const textDecoder = new TextDecoder("utf-8");
            data = textDecoder.decode(record.data);
          } else {
            // For unknown types, just show it's binary data
            data = `Binary data (${record.data?.byteLength} bytes)`;
          }

          extractedRecords.push(`Record ${index + 1} (${record.recordType}): ${data}`);
        });

        setTagData({
          uid: serialNumber || "Unknown UID",
          // Join all records into a single string for display
          record: extractedRecords.length > 0 ? extractedRecords.join(" | ") : "Empty tag",
        });
        setStatus("Tag scanned successfully!");
      };
    } catch (error) {
      console.error(error);

      // Type guard: check if error is actually an Error object to fix TS18046
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setStatus("Permission denied. Web NFC requires permission to run.");
        } else {
          setStatus(`Error: ${error.message}`);
        }
      } else {
        // Fallback for weird edge cases where something else was thrown
        setStatus("An unknown error occurred.");
      }
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h2>Samsung Mobile Web NFC Reader</h2>
      <p>
        <strong>Status:</strong> {status}
      </p>

      {isSupported && (
        <button
          onClick={handleScan}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#0377fc",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Activate NFC Scanner
        </button>
      )}

      {tagData.uid && (
        <div style={{ marginTop: "20px", textAlign: "left", display: "inline-block", border: "1px solid #ccc", padding: "15px" }}>
          <p>
            <strong>Tag UID (Serial):</strong> {tagData.uid}
          </p>
          <p>
            <strong>Payload Text:</strong> {tagData.record}
          </p>
        </div>
      )}
    </div>
  );
}

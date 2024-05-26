"use client";
import React from "react";

function RDSD() {
  const [features, setFeatures] = React.useState([]);
  const [coreFeatures, setCoreFeatures] = React.useState([]);
  const [systemName, setSystemName] = React.useState("");
  const [additionalFeature, setAdditionalFeature] = React.useState("");

  const handleAIInvocation = async () => {
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `AIzaSyAXjwDL8hPX5Q5A5zhPODcZjbWoA79ujq0`, // Replace with your actual API key
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: systemName }],
            maxOutputTokens: 100, // Adjust as needed
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const newFeatures = result.choices[0].message.content
        .match(/"(.*?)"/g)
        .map((f) => f.replace(/"/g, ""));
      setFeatures(newFeatures);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddFeature = () => {
    if (additionalFeature.trim()) {
      setFeatures([...features, additionalFeature.trim()]);
      setAdditionalFeature("");
    }
  };

  const handleFeatureDelete = (feature) => {
    setFeatures(features.filter((f) => f !== feature));
  };

  const handleCoreFeatureChange = (index, value) => {
    const newCoreFeatures = [...coreFeatures];
    newCoreFeatures[index] = value;
    setCoreFeatures(newCoreFeatures);
  };

  const getAvailableOptions = (selected) => {
    return features.filter((f) => !selected.includes(f));
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label
          htmlFor="systemName"
          className="block font-bold mb-2 font-roboto"
        >
          システム名を入力してください:
        </label>
        <input
          type="text"
          id="systemName"
          name="systemName"
          className="border border-gray-300 p-2 w-full font-roboto"
          value={systemName}
          onChange={(e) => setSystemName(e.target.value)}
        />
        <button
          className="mt-4 bg-blue-500 text-white p-2 rounded font-roboto"
          onClick={handleAIInvocation}
        >
          AIを呼び出す
        </button>
      </div>

      <div className="mb-4">
        <p className="font-bold font-roboto mb-2">提案機能:</p>
        <div className="flex flex-wrap space-x-2 space-y-2">
          {features.map((feature) => (
            <span
              key={feature}
              className="bg-gray-200 text-gray-800 p-2 rounded font-roboto flex items-center"
            >
              {feature}
              <button
                className="ml-2 text-red-500"
                onClick={() => handleFeatureDelete(feature)}
              >
                ✖️
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="additionalFeature"
          className="block font-bold mb-2 font-roboto"
        >
          追加する機能:
        </label>
        <input
          type="text"
          id="additionalFeature"
          name="additionalFeature"
          className="border border-gray-300 p-2 w-full font-roboto"
          value={additionalFeature}
          onChange={(e) => setAdditionalFeature(e.target.value)}
        />
        <button
          className="mt-4 bg-green-500 text-white p-2 rounded font-roboto"
          onClick={handleAddFeature}
        >
          追加
        </button>
      </div>

      <div className="mb-4">
        <label
          htmlFor="coreFeature1"
          className="block font-bold mb-2 font-roboto"
        >
          コア機能1:
        </label>
        <select
          id="coreFeature1"
          name="coreFeature1"
          className="border border-gray-300 p-2 w-full font-roboto"
          value={coreFeatures[0] || ""}
          onChange={(e) => handleCoreFeatureChange(0, e.target.value)}
        >
          <option value="" disabled>
            選択してください
          </option>
          {getAvailableOptions([]).map((feature) => (
            <option key={feature} value={feature}>
              {feature}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="coreFeature2"
          className="block font-bold mb-2 font-roboto"
        >
          コア機能2:
        </label>
        <select
          id="coreFeature2"
          name="coreFeature2"
          className="border border-gray-300 p-2 w-full font-roboto"
          value={coreFeatures[1] || ""}
          onChange={(e) => handleCoreFeatureChange(1, e.target.value)}
          disabled={!coreFeatures[0]}
        >
          <option value="" disabled>
            選択してください
          </option>
          {getAvailableOptions([coreFeatures[0]]).map((feature) => (
            <option key={feature} value={feature}>
              {feature}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="coreFeature3"
          className="block font-bold mb-2 font-roboto"
        >
          コア機能3:
        </label>
        <select
          id="coreFeature3"
          name="coreFeature3"
          className="border border-gray-300 p-2 w-full font-roboto"
          value={coreFeatures[2] || ""}
          onChange={(e) => handleCoreFeatureChange(2, e.target.value)}
          disabled={!coreFeatures[1]}
        >
          <option value="" disabled>
            選択してください
          </option>
          {getAvailableOptions([coreFeatures[0], coreFeatures[1]]).map(
            (feature) => (
              <option key={feature} value={feature}>
                {feature}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );
}

export default RDSD;

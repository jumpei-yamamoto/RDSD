import React, { useState } from "react";

function App() {
  const [features, setFeatures] = useState([]);
  const [generatedText, setGeneratedText] = useState("");
  const [systemName, setSystemName] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [additionalFeature, setAdditionalFeature] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [designs, setDesigns] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  console.log("API_BASE_URL:", API_BASE_URL);

  const handleAIInvocation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoke-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ systemName, features: featuresInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setGeneratedText(result.generated_text);
      setFeatures(result.features);
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

  const toggleSelectFeature = (feature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else if (selectedFeatures.length < 5) {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleDesignRequest = async () => {
    const designRequests = selectedFeatures.map(async (feature) => {
      const response = await fetch("http://localhost:8000/design-feature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemName,
          featuresInput,
          feature,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { feature, design: result.design };
    });

    const designs = await Promise.all(designRequests);
    const newDesigns = {};
    designs.forEach(({ feature, design }) => {
      newDesigns[feature] = design;
    });

    setDesigns(newDesigns);
  };

  const handleDesignChange = (feature, newText) => {
    setDesigns({
      ...designs,
      [feature]: newText,
    });
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
      </div>

      <div className="mb-4">
        <label
          htmlFor="featuresInput"
          className="block font-bold mb-2 font-roboto"
        >
          特徴を簡潔に入力してください:
        </label>
        <input
          type="text"
          id="featuresInput"
          name="featuresInput"
          className="border border-gray-300 p-2 w-full font-roboto"
          value={featuresInput}
          onChange={(e) => setFeaturesInput(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <button
          className="bg-blue-500 text-white p-2 rounded font-roboto"
          onClick={handleAIInvocation}
        >
          AIを呼び出す
        </button>
      </div>

      <div className="mb-4">
        <p className="font-bold font-roboto mb-2">AIの返答:</p>
        <div className="bg-gray-200 text-gray-800 p-2 rounded font-roboto">
          {generatedText}
        </div>
      </div>

      <div className="mb-4">
        <p className="font-bold font-roboto mb-2">
          提案機能: コア機能を最大5つクリックして選択してください (最低3つ)
        </p>
        <div className="flex flex-wrap space-x-2 space-y-2">
          {features.map((feature, index) => (
            <span
              key={index}
              className={`p-2 rounded font-roboto flex items-center cursor-pointer ${
                selectedFeatures.includes(feature)
                  ? "bg-red-200"
                  : "bg-gray-200"
              } text-gray-800`}
              onClick={() => toggleSelectFeature(feature)}
            >
              {feature}
              <button
                className="ml-2 text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFeatureDelete(feature);
                }}
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
          追加する機能:AIの返答にない機能を自由に追加してください
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

      {selectedFeatures.length > 0 && (
        <div className="mb-4">
          <p className="font-bold font-roboto mb-2">コア機能:</p>
          <div className="flex flex-wrap space-x-2 space-y-2">
            {selectedFeatures.map((feature, index) => (
              <span
                key={index}
                className="bg-red-200 text-gray-800 p-2 rounded font-roboto flex items-center"
              >
                {feature}
              </span>
            ))}
          </div>
          {selectedFeatures.length >= 3 && (
            <button
              className="mt-4 bg-purple-500 text-white p-2 rounded font-roboto"
              onClick={handleDesignRequest}
            >
              設計を依頼
            </button>
          )}
        </div>
      )}

      {Object.keys(designs).length > 0 && (
        <div className="mb-4">
          <p className="font-bold font-roboto mb-2">設計:</p>
          <div className="flex flex-wrap space-x-2 space-y-2">
            {Object.entries(designs).map(([feature, design], index) => (
              <div
                key={index}
                className="bg-white p-4 rounded shadow-md w-full"
              >
                <p className="font-bold mb-2">{feature}</p>
                <textarea
                  className="border border-gray-300 p-2 w-full"
                  value={design}
                  onChange={(e) => handleDesignChange(feature, e.target.value)}
                  rows={10}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

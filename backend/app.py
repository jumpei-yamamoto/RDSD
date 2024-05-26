from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as gemini

load_dotenv()  # .envファイルから環境変数を読み込む

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
CORS(app, resources={r"/*": {"origins": "*"}})  # CORSを有効にし、すべてのオリジンを許可する

# APIキーを設定
api_key = os.getenv('API_KEY')
gemini.configure(api_key=api_key)

@app.route('/invoke-ai', methods=['POST'])
def invoke_ai():
    data = request.json
    system_name = data.get('systemName')
    features_input = data.get('features')

    try:
        model = gemini.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f'システム名: {system_name}\n特徴: {features_input}\nシステム名に必要な機能を5つ以上記載し、"<>"で囲ってください。'
        response = model.generate_content(prompt)
        generated_text = response.candidates[0].content.parts[0].text
        features = [feature.strip('<>') for feature in generated_text.split('**') if feature.startswith('<') and feature.endswith('>')]
        return jsonify({"generated_text": generated_text, "features": features})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/design-feature', methods=['POST'])
def design_feature():
    data = request.json
    system_name = data.get('systemName')
    features_input = data.get('featuresInput')
    feature = data.get('feature')

    try:
        model = gemini.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f'{features_input}の{system_name}に必要な{feature}の設計を箇条書きで教えてください。各機能毎に別カードとして表示したいため、切り分けやすいように返答お願いします。'
        response = model.generate_content(prompt)
        design = response.candidates[0].content.parts[0].text
        cleaned_design = design.replace('**', '')
        design_lines = cleaned_design.split('\n')
        formatted_design = '\n'.join([f'・{line.strip()}' for line in design_lines if line.strip()][:10])
        if len(formatted_design.split('\n')) < 5:
            formatted_design += '\n' * (5 - len(formatted_design.split('\n')))
        return jsonify({"design": formatted_design})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=8002)

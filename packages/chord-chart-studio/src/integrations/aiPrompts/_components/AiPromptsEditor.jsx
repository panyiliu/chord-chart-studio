import './AiPromptsEditor.scss';

import React from 'react';
import PropTypes from 'prop-types';

function AiPromptsEditor(props) {
	const {
		systemPromptAppend,
		importUserPromptPreamble,
		connectivityTestUserMessage,
		allowedGenresBlockTemplate,
		allowedTagsBlockTemplate,
		authorBindingBlockTemplate,
		catalogInjectionBlockTemplate,
		metadataInferenceRuntimePromptAppend,
		setAiPrompts,
		showGlobalFields,
		showConnectivityField,
	} = props;

	return (
		<div className="aiPromptsEditor">
			{showGlobalFields ? (
				<>
					<div className="aiPromptsEditor-title">全局提示补充</div>
					<label
						className="aiPromptsEditor-label"
						htmlFor="ai-prompt-append"
					>
						附加系统提示（追加在「提示词模板」与动态曲库约束之后）
					</label>
					<textarea
						id="ai-prompt-append"
						className="aiPromptsEditor-textarea"
						rows={4}
						value={systemPromptAppend}
						onChange={(e) =>
							setAiPrompts({ systemPromptAppend: e.target.value })
						}
						placeholder="可选：例如风格、语言、排版偏好等"
					/>
					<label
						className="aiPromptsEditor-label"
						htmlFor="ai-prompt-import-user"
					>
						导入场景 user 前置说明（完全可编辑）
					</label>
					<textarea
						id="ai-prompt-import-user"
						className="aiPromptsEditor-textarea"
						rows={6}
						value={importUserPromptPreamble}
						onChange={(e) =>
							setAiPrompts({
								importUserPromptPreamble: e.target.value,
							})
						}
						placeholder="例如：硬性 JSON 约束、字段要求、输出格式约束等"
					/>
					<label
						className="aiPromptsEditor-label"
						htmlFor="ai-prompt-catalog-injection"
					>
						曲库注入块（合并编辑，推荐）
					</label>
					<textarea
						id="ai-prompt-catalog-injection"
						className="aiPromptsEditor-textarea"
						rows={8}
						value={catalogInjectionBlockTemplate}
						onChange={(e) =>
							setAiPrompts({
								catalogInjectionBlockTemplate: e.target.value,
							})
						}
						placeholder={'可用变量：{{ALLOWED_GENRES_BLOCK}} {{ALLOWED_TAGS_BLOCK}} {{AUTHOR_BINDING_BLOCK}}；留空则使用下方分块模板'}
					/>
					<label className="aiPromptsEditor-label" htmlFor="ai-prompt-genres">
						可编辑注入块：__APP_INJECT_ALLOWED_GENRES__
					</label>
					<textarea
						id="ai-prompt-genres"
						className="aiPromptsEditor-textarea"
						rows={6}
						value={allowedGenresBlockTemplate}
						onChange={(e) =>
							setAiPrompts({
								allowedGenresBlockTemplate: e.target.value,
							})
						}
					/>
					<label className="aiPromptsEditor-label" htmlFor="ai-prompt-tags">
						可编辑注入块：__APP_INJECT_ALLOWED_TAGS__
					</label>
					<textarea
						id="ai-prompt-tags"
						className="aiPromptsEditor-textarea"
						rows={6}
						value={allowedTagsBlockTemplate}
						onChange={(e) =>
							setAiPrompts({
								allowedTagsBlockTemplate: e.target.value,
							})
						}
					/>
					<label className="aiPromptsEditor-label" htmlFor="ai-prompt-author-binding">
						可编辑注入块：__APP_INJECT_AUTHOR_BINDING__
					</label>
					<textarea
						id="ai-prompt-author-binding"
						className="aiPromptsEditor-textarea"
						rows={6}
						value={authorBindingBlockTemplate}
						onChange={(e) =>
							setAiPrompts({
								authorBindingBlockTemplate: e.target.value,
							})
						}
					/>
					<label className="aiPromptsEditor-label" htmlFor="ai-prompt-runtime-policy">
						可编辑注入块：强制输出策略（应用级）
					</label>
					<textarea
						id="ai-prompt-runtime-policy"
						className="aiPromptsEditor-textarea"
						rows={5}
						value={metadataInferenceRuntimePromptAppend}
						onChange={(e) =>
							setAiPrompts({
								metadataInferenceRuntimePromptAppend: e.target.value,
							})
						}
					/>
				</>
			) : null}
			{showConnectivityField ? (
				<>
					<div className="aiPromptsEditor-title">连通性测试</div>
					<label
						className="aiPromptsEditor-label"
						htmlFor="ai-prompt-test"
					>
						测试消息（发给模型用户角色）
					</label>
					<textarea
						id="ai-prompt-test"
						className="aiPromptsEditor-textarea"
						rows={2}
						value={connectivityTestUserMessage}
						onChange={(e) =>
							setAiPrompts({
								connectivityTestUserMessage: e.target.value,
							})
						}
					/>
				</>
			) : null}
		</div>
	);
}

AiPromptsEditor.propTypes = {
	systemPromptAppend: PropTypes.string.isRequired,
	importUserPromptPreamble: PropTypes.string.isRequired,
	connectivityTestUserMessage: PropTypes.string.isRequired,
	allowedGenresBlockTemplate: PropTypes.string.isRequired,
	allowedTagsBlockTemplate: PropTypes.string.isRequired,
	authorBindingBlockTemplate: PropTypes.string.isRequired,
	catalogInjectionBlockTemplate: PropTypes.string.isRequired,
	metadataInferenceRuntimePromptAppend: PropTypes.string.isRequired,
	setAiPrompts: PropTypes.func.isRequired,
	showGlobalFields: PropTypes.bool,
	showConnectivityField: PropTypes.bool,
};

AiPromptsEditor.defaultProps = {
	showGlobalFields: true,
	showConnectivityField: true,
};

export default AiPromptsEditor;

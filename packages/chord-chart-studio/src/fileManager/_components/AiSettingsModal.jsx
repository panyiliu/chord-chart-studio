import './AiSettingsModal.scss';

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Modal from '../../ui/_components/Modal';
import Button from '../../ui/_components/Button';
import AiEnginesPanel from '../../integrations/aiEngines/_containers/AiEnginesPanel';
import SettingsPromptsTab from '../../integrations/aiPromptTemplates/_containers/SettingsPromptsTab';
import RawChordTransformSettingsPanel from '../../editor/songEditor/rawChordToChordMark/_components/RawChordTransformSettingsPanel';
import BackupSettingsPanel from '../../backup/BackupSettingsPanel';
import { useI18n } from '../../ui/i18n/I18nProvider';

function AiSettingsModal(props) {
	const { closeModal } = props;
	const { t } = useI18n();
	const [mainTab, setMainTab] = useState(
		/** @type {'engines' | 'prompts' | 'chordmark' | 'backup'} */ ('engines')
	);

	return (
		<Modal closeModal={closeModal}>
			<section
				className={
					'mod-ModalConfirmContainer mod-ModalSettingsWide aiSettingsModal aiSettingsModal--wide'
				}
			>
				<header className="aiSettingsModal-header">
					<h2 className="mod-ModalSettingsTitle aiSettingsModal-title">
						{t('设置')}
					</h2>
					<p className="aiSettingsModal-lead">
						{t(
							'集中配置 AI 引擎、提示词模板、ChordMark 整理规则与备份恢复。'
						)}
					</p>
				</header>

				<div
					className="aiSettingsModal-mainTabs"
					role="tablist"
					aria-label={t('设置分类')}
				>
					<button
						type="button"
						className={
							mainTab === 'engines'
								? 'aiSettingsModal-mainTab aiSettingsModal-mainTab--active'
								: 'aiSettingsModal-mainTab'
						}
						role="tab"
						aria-selected={mainTab === 'engines'}
						onClick={() => setMainTab('engines')}
					>
						{t('AI引擎')}
					</button>
					<button
						type="button"
						className={
							mainTab === 'prompts'
								? 'aiSettingsModal-mainTab aiSettingsModal-mainTab--active'
								: 'aiSettingsModal-mainTab'
						}
						role="tab"
						aria-selected={mainTab === 'prompts'}
						onClick={() => setMainTab('prompts')}
					>
						{t('提示词模板')}
					</button>
					<button
						type="button"
						className={
							mainTab === 'chordmark'
								? 'aiSettingsModal-mainTab aiSettingsModal-mainTab--active'
								: 'aiSettingsModal-mainTab'
						}
						role="tab"
						aria-selected={mainTab === 'chordmark'}
						onClick={() => setMainTab('chordmark')}
					>
						{t('ChordMark整理')}
					</button>
					<button
						type="button"
						className={
							mainTab === 'backup'
								? 'aiSettingsModal-mainTab aiSettingsModal-mainTab--active'
								: 'aiSettingsModal-mainTab'
						}
						role="tab"
						aria-selected={mainTab === 'backup'}
						onClick={() => setMainTab('backup')}
					>
						{t('备份')}
					</button>
				</div>

				<div className="aiSettingsModal-scroll aiSettingsModal-body">
					{mainTab === 'engines' ? (
						<section
							className="aiSettingsModal-section aiSettingsModal-section--last"
							aria-labelledby="settings-engines"
						>
							<div className="aiSettingsModal-sectionHead">
								<h3
									className="aiSettingsModal-sectionTitle"
									id="settings-engines"
								>
									{t('模型与连接')}
								</h3>
								<p className="aiSettingsModal-sectionDesc">
									{t('管理模型连接与默认引擎。')}
									<span
										className={'aiSettingsModal-helpDot'}
										title={t(
											'各 AI 功能的专用引擎在「提示词模板 → AI引擎」分页中配置。'
										)}
									>
										?
									</span>
								</p>
							</div>
							<div className="aiSettingsModal-panel">
								<AiEnginesPanel />
							</div>
						</section>
					) : mainTab === 'prompts' ? (
						<section
							className="aiSettingsModal-section aiSettingsModal-section--last"
							aria-labelledby="settings-prompts"
						>
							<div className="aiSettingsModal-sectionHead">
								<h3
									className="aiSettingsModal-sectionTitle"
									id="settings-prompts"
								>
									{t('提示词与模板')}
								</h3>
								<p className="aiSettingsModal-sectionDesc">
									{t('按功能绑定引擎与模板。')}
								</p>
							</div>
							<div className="aiSettingsModal-panel aiSettingsModal-panel--flush">
								<SettingsPromptsTab />
							</div>
						</section>
					) : mainTab === 'chordmark' ? (
						<section
							className="aiSettingsModal-section aiSettingsModal-section--last"
							aria-labelledby="settings-chordmark"
						>
							<div className="aiSettingsModal-sectionHead">
								<h3
									className="aiSettingsModal-sectionTitle"
									id="settings-chordmark"
								>
									{t('整理为 ChordMark')}
								</h3>
								<p className="aiSettingsModal-sectionDesc">
									{t('配置整理规则。')}
									<span
										className={'aiSettingsModal-helpDot'}
										title={t(
											'可配置段落映射、噪声截断关键词与规则代码。'
										)}
									>
										?
									</span>
								</p>
							</div>
							<div className="aiSettingsModal-panel aiSettingsModal-panel--flush">
								<RawChordTransformSettingsPanel />
							</div>
						</section>
					) : mainTab === 'backup' ? (
						<section
							className="aiSettingsModal-section aiSettingsModal-section--last"
							aria-labelledby="settings-backup"
						>
							<div className="aiSettingsModal-sectionHead">
								<h3
									className="aiSettingsModal-sectionTitle"
									id="settings-backup"
								>
									{t('备份设置')}
								</h3>
								<p className="aiSettingsModal-sectionDesc">
									{t('云备份与恢复。')}
									<span
										className={'aiSettingsModal-helpDot'}
										title={t('仅保留一个版本：每次备份覆盖旧备份。')}
									>
										?
									</span>
								</p>
							</div>
							<div className="aiSettingsModal-panel aiSettingsModal-panel--flush">
								<BackupSettingsPanel />
							</div>
						</section>
					) : null}
				</div>

				<div className="mod-ModalConfirmButtons aiSettingsModal-actions">
					<Button
						type="secondary"
						buttonName="aiSettingsClose"
						onClick={closeModal}
					>
						{t('关闭')}
					</Button>
				</div>
			</section>
		</Modal>
	);
}

AiSettingsModal.propTypes = {
	closeModal: PropTypes.func.isRequired,
};

export default AiSettingsModal;

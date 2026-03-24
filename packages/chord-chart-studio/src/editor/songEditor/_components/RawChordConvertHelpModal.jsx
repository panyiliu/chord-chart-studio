import './RawChordConvertHelpModal.scss';

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

import { useEffectiveUiTheme } from '../../../ui/theme/useEffectiveUiTheme';
import { useI18n } from '../../../ui/i18n/I18nProvider';

function RawChordConvertHelpModal(props) {
	const { onClose } = props;
	const { t } = useI18n();
	const uiTheme = useEffectiveUiTheme();
	const themeClass = uiTheme === 'dark' ? 'theme-dark' : 'theme-light';

	useEffect(() => {
		const onKey = (e) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onClose]);

	const node = (
		<section className={`mod-RawChordConvertHelpModal ${themeClass}`}>
			<button
				type={'button'}
				className={'mod-RawChordConvertHelpModal-overlay'}
				aria-label={t('关闭')}
				onClick={onClose}
			/>
			<div
				className={'mod-RawChordConvertHelpModal-panel'}
				role={'dialog'}
				aria-modal={'true'}
				aria-labelledby={'rawChordConvertHelp-title'}
			>
				<div className={'mod-RawChordConvertHelpModal-head'}>
					<h2
						id={'rawChordConvertHelp-title'}
						className={'mod-RawChordConvertHelpModal-title'}
					>
						{t('整理为 ChordMark · 内置规则与顺序')}
					</h2>
					<button
						type={'button'}
						className={'mod-RawChordConvertHelpModal-close'}
						onClick={onClose}
					>
						{t('关闭')}
					</button>
				</div>
				<div className={'mod-RawChordConvertHelpModal-body'}>
					<p className={'mod-RawChordConvertHelpModal-lead'}>
						点击「整理为
						ChordMark」会用当前编辑区全文做一次转换，并写回
						ChordMark 源码（支持撤销）。下面按
						<strong>实际执行顺序</strong>列出内置步骤；你在「设置 →
						ChordMark整理」里配的规则会在第 2 步参与。
					</p>
					<ol className={'mod-RawChordConvertHelpModal-steps'}>
						<li>
							<strong>抓取 Artist（先于噪声规则）</strong>在
							<strong>原始全文</strong>
							（尚未跑截断规则）里查找：同一行同时出现{' '}
							<code>views</code>、<code>saves</code>、
							<code>comments</code>
							；再向上跳过空行，取最近一行非空行，匹配「歌名{' '}
							<code>Chords by</code>{' '}
							歌手」。若成功，只记下歌手名，供最后一步写到最顶行。
						</li>
						<li>
							<strong>噪声截断（你的自定义规则）</strong>
							按「设置 →
							ChordMark整理」中的关键词、删除前/后、或者/并且等规则过滤行（与
							localStorage 中的默认合并）。
						</li>
						<li>
							<strong>去掉已识别的广告行</strong>
							若第 1
							步成功，从「规则处理后的正文」里删除对应的那一行的「Chords
							by」行与统计行，避免与后面的 <code>
								Artist
							</code>{' '}
							重复。
						</li>
						<li>
							<strong>逐行转换正文</strong>
							（从上到下依次匹配，命中一种则继续下一行）
							<ul>
								<li>
									<strong>Key</strong>
									：识别行内 <code>
										Key:
									</code>（含与调音粘连的 <code>EKey:</code>{' '}
									等形式），从该行去掉 Key
									片段，再插入空行与标准行 <code>key 调</code>
									（小写 <code>key</code> + 空格 + 调号）。
								</li>
								<li>
									<strong>段落映射</strong>
									：将 verse / chorus
									等关键字（可在设置里改）转为 <code>#v</code>
									、<code>#c</code> 等段落标记。
								</li>
								<li>
									<strong>空行</strong>：保留。
								</li>
								<li>
									<strong>和弦 + 歌词</strong>
									：若一行判为和弦行且下一行非和弦且有文字，则合并为
									ChordMark 对齐（歌词中用 <code>_</code>{' '}
									标落点）。
								</li>
								<li>
									<strong>仅和弦行</strong>：和弦压缩到一行。
								</li>
								<li>
									<strong>其余</strong>：原样输出。
								</li>
							</ul>
						</li>
						<li>
							<strong>顶层插入 Artist</strong>
							若第 1 步识别到歌手，在
							<strong>全部转换完成后</strong>
							，在结果最前面插入一行 <code>前缀 + 歌手名</code>
							（前缀默认 <code>Artist: </code>，可在「设置 →
							ChordMark整理 → 网页识别 Artist
							行前缀」修改，例如不要冒号可改为{' '}
							<code>Artist </code>），再空一行，再接正文（Key
							等仍在正文中的对应位置）。
						</li>
					</ol>
					<p className={'mod-RawChordConvertHelpModal-foot'}>
						段落映射、噪声截断与 Artist 行前缀请在「设置 →
						ChordMark整理」中查看与修改；本说明对应实现文件{' '}
						<code>convertRawChordSheet.js</code> 与{' '}
						<code>rawChordTransformOptions.js</code>。
					</p>
				</div>
			</div>
		</section>
	);

	return createPortal(node, document.body);
}

RawChordConvertHelpModal.propTypes = {
	onClose: PropTypes.func.isRequired,
};

export default RawChordConvertHelpModal;

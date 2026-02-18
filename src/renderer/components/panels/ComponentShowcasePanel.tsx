import {
  Button,
  Checkbox,
  Dialog,
  Form,
  Input,
  Menu,
  RadioGroup,
  Select,
  Switch,
  Tabs,
  type TabItem,
} from '@chips/components';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { t } from '../../services/i18n-service';
import { InfoBanner, PanelHeader, PanelShell } from './PanelPrimitives';

export default function ComponentShowcasePanel() {
  const [clickCount, setClickCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [formResult, setFormResult] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [advancedModeEnabled, setAdvancedModeEnabled] = useState(false);
  const [density, setDensity] = useState('comfortable');
  const [themeVariant, setThemeVariant] = useState('default');
  const [menuAction, setMenuAction] = useState('');
  const [previewTab, setPreviewTab] = useState('intro');

  const menuItems = [
    { id: 'settings', label: t('test.components.menu_open_settings') },
    { id: 'refresh', label: t('test.components.menu_refresh') },
    { id: 'export', label: t('test.components.menu_export') },
  ];

  const previewItems: TabItem[] = [
    {
      id: 'intro',
      label: t('test.components.tabs_intro'),
      content: <p className="showcase-tab-content">{t('test.components.tabs_intro_content')}</p>,
    },
    {
      id: 'tokens',
      label: t('test.components.tabs_tokens'),
      content: <p className="showcase-tab-content">{t('test.components.tabs_tokens_content')}</p>,
    },
    {
      id: 'preview',
      label: t('test.components.tabs_preview'),
      content: <p className="showcase-tab-content">{t('test.components.tabs_preview_content')}</p>,
    },
  ];

  const resetDemoState = () => {
    setClickCount(0);
    setInputValue('');
    setFormResult('');
    setNotificationsEnabled(true);
    setAdvancedModeEnabled(false);
    setDensity('comfortable');
    setThemeVariant('default');
    setMenuAction('');
    setPreviewTab('intro');
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormResult(inputValue.trim());
  };

  const selectedMenuLabel = menuItems.find((item) => item.id === menuAction)?.label;

  return (
    <PanelShell>
      <PanelHeader
        title={t('test.components.title')}
        description={t('test.components.description')}
        actions={[
          {
            key: 'reset',
            label: t('test.components.actions_reset'),
            onClick: resetDemoState,
            variant: 'ghost',
          },
        ]}
      />

      <InfoBanner icon="🧩" text={t('test.components.banner_info')} />

      <div className="component-showcase-grid">
        <section className="showcase-card">
          <h4 className="showcase-card-title">{t('test.components.section_button')}</h4>
          <div className="showcase-row">
            <Button
              chipsScope="showcase-button"
              className="showcase-button primary"
              onClick={() => setClickCount((value) => value + 1)}
            >
              {t('test.components.button_primary')}
            </Button>
            <Button chipsScope="showcase-button" className="showcase-button">
              {t('test.components.button_secondary')}
            </Button>
            <Button chipsScope="showcase-button" className="showcase-button" disabled>
              {t('test.components.button_disabled')}
            </Button>
          </div>
          <p className="showcase-tip">
            {t('test.components.click_count', { count: clickCount })}
          </p>
        </section>

        <section className="showcase-card">
          <h4 className="showcase-card-title">{t('test.components.section_form')}</h4>
          <Form chipsScope="showcase-form" className="showcase-form" onSubmit={handleFormSubmit}>
            <Input
              chipsScope="showcase-input"
              className="showcase-input"
              label={t('test.components.input_label')}
              placeholder={t('test.components.input_placeholder')}
              helperText={t('test.components.helper_text')}
              value={inputValue}
              onChange={(event) => setInputValue(event.currentTarget.value)}
            />
            <Button chipsScope="showcase-button" className="showcase-button primary" type="submit">
              {t('test.components.form_submit')}
            </Button>
          </Form>
          <p className="showcase-tip">
            {t('test.components.form_result', {
              value: formResult || t('test.components.form_empty'),
            })}
          </p>
        </section>

        <section className="showcase-card">
          <h4 className="showcase-card-title">{t('test.components.section_selection')}</h4>
          <div className="showcase-column">
            <Checkbox
              className="showcase-checkbox"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            >
              {t('test.components.checkbox_label')}
            </Checkbox>
            <Switch
              chipsScope="showcase-switch"
              className="showcase-switch"
              checked={advancedModeEnabled}
              onCheckedChange={setAdvancedModeEnabled}
            >
              {t('test.components.switch_label')}
            </Switch>
            <RadioGroup
              chipsScope="showcase-radio"
              className="showcase-radio-group"
              value={density}
              onValueChange={setDensity}
              options={[
                { value: 'compact', label: t('test.components.radio_compact') },
                { value: 'comfortable', label: t('test.components.radio_comfortable') },
                { value: 'spacious', label: t('test.components.radio_spacious') },
              ]}
            />
            <Select
              chipsScope="showcase-select"
              className="showcase-select"
              label={t('test.components.select_label')}
              placeholder={t('test.components.select_placeholder')}
              value={themeVariant}
              onValueChange={(value) => setThemeVariant(value ?? 'default')}
              options={[
                { value: 'default', label: t('test.components.select_default') },
                { value: 'glass', label: t('test.components.select_glass') },
                { value: 'material3', label: t('test.components.select_material') },
                { value: 'fluent', label: t('test.components.select_fluent') },
              ]}
            />
          </div>
        </section>

        <section className="showcase-card">
          <h4 className="showcase-card-title">{t('test.components.section_overlay')}</h4>
          <div className="showcase-row">
            <Menu
              chipsScope="showcase-menu"
              trigger={
                <span className="showcase-button showcase-trigger-btn">
                  {t('test.components.menu_trigger')}
                </span>
              }
              items={menuItems}
              onSelect={setMenuAction}
            />
            <Dialog
              chipsScope="showcase-dialog"
              trigger={
                <span className="showcase-button primary showcase-trigger-btn">
                  {t('test.components.dialog_trigger')}
                </span>
              }
              title={t('test.components.dialog_title')}
              description={t('test.components.dialog_desc')}
            >
              <p className="showcase-dialog-body">{t('test.components.dialog_body')}</p>
            </Dialog>
          </div>
          <p className="showcase-tip">
            {t('test.components.menu_selected', {
              action: selectedMenuLabel ?? t('test.components.menu_empty'),
            })}
          </p>
        </section>

        <section className="showcase-card full-width">
          <h4 className="showcase-card-title">{t('test.components.section_tabs')}</h4>
          <Tabs
            chipsScope="showcase-inner-tabs"
            className="showcase-inner-tabs"
            value={previewTab}
            onValueChange={setPreviewTab}
            items={previewItems}
          />
        </section>
      </div>
    </PanelShell>
  );
}

/// <reference types="@girs/gtk-4.0/ambient" />
/// <reference types="@girs/gnome-shell/extensions/prefs/ambient" />

import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';


export default class ExamplePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Appearance'),
            description: _('Configure the appearance of the extension'),
        });
        page.add(group);

        const row1 = new Adw.SwitchRow({
            title: _('Show gtx1080ti'),
            subtitle: _('Whether to show gtx1080ti'),
        });
        group.add(row1);
        window._settings.bind('gtx1080ti', row1, 'active', Gio.SettingsBindFlags.DEFAULT);

        const row2 = new Adw.SwitchRow({
            title: _('Show rtx3090'),
            subtitle: _('Whether to show rtx3090'),
        });
        group.add(row2);
        window._settings.bind('rtx3090', row2, 'active', Gio.SettingsBindFlags.DEFAULT);

        const row3 = new Adw.SwitchRow({
            title: _('Show teslav100'),
            subtitle: _('Whether to show teslav100'),
        });
        group.add(row3);
        window._settings.bind('teslav100', row3, 'active', Gio.SettingsBindFlags.DEFAULT);

        const row4 = new Adw.SwitchRow({
            title: _('Show teslaa40_L'),
            subtitle: _('Whether to show teslaa40_L'),
        });
        group.add(row4);
        window._settings.bind('teslaa40', row4, 'active', Gio.SettingsBindFlags.DEFAULT);

        const row5 = new Adw.SwitchRow({
            title: _('Show debug'),
            subtitle: _('Whether to show debug'),
        });
        group.add(row5);
        window._settings.bind('debug', row5, 'active', Gio.SettingsBindFlags.DEFAULT);
    }
}

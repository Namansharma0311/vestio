package com.closetkeeper.app;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetSync")
public class WidgetSyncPlugin extends Plugin {

    public static final String PREFS = "widget_data";

    @PluginMethod
    public void syncData(PluginCall call) {
        try {
            String clothes = call.getString("clothes", "[]");
            String outfits = call.getString("outfits", "[]");
            long canvas = getColor(call, "canvasColor", 0xfffaf7f1L);
            long surface = getColor(call, "surfaceColor", 0xffffffffL);
            long ink = getColor(call, "inkColor", 0xff21201dL);
            long accent = getColor(call, "accentColor", 0xff4b5c3fL);
            long border = getColor(call, "borderColor", 0xffdedaceL);
            long muted = getColor(call, "mutedColor", 0x8021201dL);

            SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            prefs.edit()
                    .putString("clothes", clothes)
                    .putString("outfits", outfits)
                    .putLong("canvasColor", canvas)
                    .putLong("surfaceColor", surface)
                    .putLong("inkColor", ink)
                    .putLong("accentColor", accent)
                    .putLong("borderColor", border)
                    .putLong("mutedColor", muted)
                    .apply();

            ClosetWidgetProvider.updateAllWidgets(getContext());
            call.resolve();
        } catch (Exception e) {
            call.reject("Widget sync failed: " + e.getMessage(), e);
        }
    }

    private long getColor(PluginCall call, String name, long fallback) {
        try {
            Long value = call.getLong(name);
            return value != null ? value : fallback;
        } catch (Exception e) {
            return fallback;
        }
    }
}

package com.closetkeeper.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class ClosetWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int widgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId);
        }
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, ClosetWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(component);
        for (int widgetId : ids) {
            updateWidget(context, manager, widgetId);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        SharedPreferences prefs = context.getSharedPreferences(WidgetSyncPlugin.PREFS, Context.MODE_PRIVATE);

        int canvas = (int) prefs.getLong("canvasColor", 0xfffaf7f1L);
        int surface = (int) prefs.getLong("surfaceColor", 0xffffffffL);
        int ink = (int) prefs.getLong("inkColor", 0xff21201dL);
        int accent = (int) prefs.getLong("accentColor", 0xff4b5c3fL);
        int muted = (int) prefs.getLong("mutedColor", 0x8021201dL);

        JSONArray clothes = parse(prefs.getString("clothes", "[]"));
        JSONArray outfits = parse(prefs.getString("outfits", "[]"));
        int clothesCount = clothes.length();
        int outfitCount = outfits.length();

        StringBuilder names = new StringBuilder();
        for (int i = 0; i < clothes.length() && i < 4; i++) {
            try {
                String name = clothes.getJSONObject(i).optString("name", "").trim();
                if (!name.isEmpty()) {
                    if (names.length() > 0) names.append("  ·  ");
                    names.append(name);
                }
            } catch (Exception ignored) {
            }
        }
        String latest = names.length() > 0
                ? names.toString()
                : (clothesCount > 0 ? "Ready to style!" : "No clothes yet — open VESTIO");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);
        views.setTextViewText(R.id.widget_title, "VESTIO");
        views.setTextViewText(R.id.widget_clothes, clothesCount + (clothesCount == 1 ? " item" : " items")
                + "  ·  " + outfitCount + (outfitCount == 1 ? " outfit" : " outfits"));
        views.setTextViewText(R.id.widget_latest, latest);

        views.setTextColor(R.id.widget_title, ink);
        views.setTextColor(R.id.widget_clothes, accent);
        views.setTextColor(R.id.widget_latest, muted);

        views.setInt(R.id.widget_bg, "setColorFilter", surface);
        views.setInt(R.id.widget_accent_bar, "setBackgroundColor", accent);

        Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent pending = PendingIntent.getActivity(context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pending);

        manager.updateAppWidget(widgetId, views);
    }

    private static JSONArray parse(String raw) {
        try {
            return new JSONArray(raw);
        } catch (Exception e) {
            return new JSONArray();
        }
    }
}

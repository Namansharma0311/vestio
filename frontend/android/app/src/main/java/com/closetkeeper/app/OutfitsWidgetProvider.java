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

public class OutfitsWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int widgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId);
        }
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, OutfitsWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(component);
        for (int widgetId : ids) {
            updateWidget(context, manager, widgetId);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        SharedPreferences prefs = context.getSharedPreferences(WidgetSyncPlugin.PREFS, Context.MODE_PRIVATE);
        int surface = (int) prefs.getLong("surfaceColor", 0xffffffffL);
        int ink = (int) prefs.getLong("inkColor", 0xff21201dL);
        int accent = (int) prefs.getLong("accentColor", 0xff4b5c3fL);
        int muted = (int) prefs.getLong("mutedColor", 0x8021201dL);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_outfits_layout);
        views.setInt(R.id.widget_outfits_bg, "setColorFilter", surface);
        views.setInt(R.id.widget_outfits_accent_bar, "setBackgroundColor", accent);
        views.setTextColor(R.id.widget_outfits_title, ink);
        views.setTextColor(R.id.widget_outfits_count, accent);
        views.setTextColor(R.id.widget_outfits_empty, muted);

        JSONArray outfits = parse(prefs.getString("outfits", "[]"));
        int count = outfits.length();
        views.setTextViewText(R.id.widget_outfits_count, count + (count == 1 ? " look saved" : " looks saved"));

        if (count == 0) {
            views.setViewVisibility(R.id.widget_outfits_list, android.view.View.GONE);
            views.setViewVisibility(R.id.widget_outfits_empty, android.view.View.VISIBLE);
            views.setTextViewText(R.id.widget_outfits_empty, "No outfits yet — open VESTIO");
        } else {
            views.setViewVisibility(R.id.widget_outfits_list, android.view.View.VISIBLE);
            views.setViewVisibility(R.id.widget_outfits_empty, android.view.View.GONE);
            int shown = 0;
            for (int i = 0; i < count && shown < 5; i++) {
                try {
                    JSONObject outfit = outfits.getJSONObject(i);
                    String name = outfit.optString("name", "").trim();
                    if (name.isEmpty()) name = "Untitled outfit";
                    RemoteViews row = new RemoteViews(context.getPackageName(), R.layout.widget_outfit_row);
                    row.setTextViewText(R.id.widget_outfit_row_name, name);
                    row.setTextColor(R.id.widget_outfit_row_name, ink);
                    row.setInt(R.id.widget_outfit_row_dot, "setBackgroundColor", accent);
                    views.addView(R.id.widget_outfits_list, row);
                    shown++;
                } catch (Exception ignored) {
                }
            }
        }

        Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent pending = PendingIntent.getActivity(context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_outfits_root, pending);

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

package com.closetkeeper.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public class OutfitSliderWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int widgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId);
        }
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, OutfitSliderWidgetProvider.class);
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

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_outfit_slider_layout);
        views.setInt(R.id.widget_outfit_slider_bg, "setColorFilter", surface);
        views.setInt(R.id.widget_outfit_accent_bar, "setBackgroundColor", accent);
        views.setTextColor(R.id.widget_outfit_title, ink);
        views.setTextColor(R.id.widget_outfit_empty, muted);

        Intent serviceIntent = new Intent(context, OutfitSliderViewsService.class);
        views.setRemoteAdapter(R.id.widget_outfit_stack, serviceIntent);
        views.setEmptyView(R.id.widget_outfit_stack, R.id.widget_outfit_empty);

        Intent launch = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent pending = PendingIntent.getActivity(context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setPendingIntentTemplate(R.id.widget_outfit_stack, pending);

        manager.updateAppWidget(widgetId, views);
    }
}

package com.closetkeeper.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

public class OutfitSliderViewsService extends RemoteViewsService {

    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new OutfitSliderFactory(getApplicationContext());
    }

    private static class OutfitSliderFactory implements RemoteViewsService.RemoteViewsFactory {
        private final Context context;
        private JSONArray outfits = new JSONArray();
        private JSONArray clothes = new JSONArray();
        private int surface = 0xffffffff;
        private int ink = 0xff21201d;
        private int accent = 0xff4b5c3f;
        private int muted = 0x8021201d;

        OutfitSliderFactory(Context context) {
            this.context = context;
        }

        private void load() {
            SharedPreferences prefs = context.getSharedPreferences(WidgetSyncPlugin.PREFS, Context.MODE_PRIVATE);
            outfits = parse(prefs.getString("outfits", "[]"));
            clothes = parse(prefs.getString("clothes", "[]"));
            surface = (int) prefs.getLong("surfaceColor", 0xffffffffL);
            ink = (int) prefs.getLong("inkColor", 0xff21201dL);
            accent = (int) prefs.getLong("accentColor", 0xff4b5c3fL);
            muted = (int) prefs.getLong("mutedColor", 0x8021201dL);
        }

        @Override
        public void onCreate() {
            load();
        }

        @Override
        public void onDataSetChanged() {
            load();
        }

        @Override
        public void onDestroy() {
        }

        @Override
        public int getCount() {
            return outfits.length();
        }

        @Override
        public RemoteViews getViewAt(int position) {
            RemoteViews card = new RemoteViews(context.getPackageName(), R.layout.widget_outfit_slider_card);
            card.setInt(R.id.widget_outfit_card_bg, "setColorFilter", surface);
            card.setTextColor(R.id.widget_outfit_card_name, ink);
            card.setTextColor(R.id.widget_outfit_card_items, muted);
            card.setTextColor(R.id.widget_outfit_card_count, accent);

            try {
                JSONObject outfit = outfits.getJSONObject(position);
                String name = outfit.optString("name", "").trim();
                card.setTextViewText(R.id.widget_outfit_card_name, name.isEmpty() ? "Untitled outfit" : name);

                JSONArray ids = outfit.optJSONArray("itemIds");
                StringBuilder items = new StringBuilder();
                int shown = 0;
                int realCount = 0;
                if (ids != null) {
                    realCount = ids.length();
                    for (int i = 0; i < ids.length() && shown < 3; i++) {
                        String itemName = findName(ids.optString(i));
                        if (!itemName.isEmpty()) {
                            if (items.length() > 0) items.append("  ·  ");
                            items.append(itemName);
                            shown++;
                        }
                    }
                }
                card.setTextViewText(R.id.widget_outfit_card_items,
                        items.length() > 0 ? items.toString() : "Tap to open VESTIO");
                card.setTextViewText(R.id.widget_outfit_card_count,
                        realCount + (realCount == 1 ? " piece" : " pieces"));
            } catch (Exception ignored) {
            }

            Intent fillIn = new Intent();
            card.setOnClickFillInIntent(R.id.widget_outfit_card_root, fillIn);
            return card;
        }

        private String findName(String id) {
            for (int i = 0; i < clothes.length(); i++) {
                try {
                    JSONObject c = clothes.getJSONObject(i);
                    if (id != null && id.equals(c.optString("id"))) {
                        return c.optString("name", "").trim();
                    }
                } catch (Exception ignored) {
                }
            }
            return "";
        }

        @Override
        public RemoteViews getLoadingView() {
            return null;
        }

        @Override
        public int getViewTypeCount() {
            return 1;
        }

        @Override
        public boolean hasStableIds() {
            return true;
        }

        @Override
        public long getItemId(int position) {
            return position;
        }
    }

    private static JSONArray parse(String raw) {
        try {
            return new JSONArray(raw);
        } catch (Exception e) {
            return new JSONArray();
        }
    }
}

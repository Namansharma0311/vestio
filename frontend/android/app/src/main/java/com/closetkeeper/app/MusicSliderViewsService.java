package com.closetkeeper.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

public class MusicSliderViewsService extends RemoteViewsService {

    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new MusicSliderFactory(getApplicationContext());
    }

    private static class MusicSliderFactory implements RemoteViewsService.RemoteViewsFactory {
        private final Context context;
        private JSONArray music = new JSONArray();
        private int surface = 0xffffffff;
        private int ink = 0xff21201d;
        private int accent = 0xff4b5c3f;
        private int muted = 0x8021201d;

        MusicSliderFactory(Context context) {
            this.context = context;
        }

        private void load() {
            SharedPreferences prefs = context.getSharedPreferences(WidgetSyncPlugin.PREFS, Context.MODE_PRIVATE);
            music = parse(prefs.getString("music", "[]"));
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
            return music.length();
        }

        @Override
        public RemoteViews getViewAt(int position) {
            RemoteViews card = new RemoteViews(context.getPackageName(), R.layout.widget_music_slider_card);
            card.setInt(R.id.widget_music_card_bg, "setColorFilter", surface);
            card.setTextColor(R.id.widget_music_rank, accent);
            card.setTextColor(R.id.widget_music_track, ink);
            card.setTextColor(R.id.widget_music_artist, muted);
            card.setTextColor(R.id.widget_music_genre, muted);

            try {
                JSONObject t = music.getJSONObject(position);
                int rank = t.optInt("rank", position + 1);
                String track = t.optString("track", "");
                String artist = t.optString("artist", "");
                String genre = t.optString("genre", "");
                String region = t.optString("region", "");

                card.setTextViewText(R.id.widget_music_rank, "#" + rank);
                card.setTextViewText(R.id.widget_music_track, track.isEmpty() ? "Untitled track" : track);
                card.setTextViewText(R.id.widget_music_artist, artist.isEmpty() ? "Unknown artist" : artist);

                StringBuilder meta = new StringBuilder();
                if (!region.isEmpty()) meta.append(region);
                if (!genre.isEmpty()) {
                    if (meta.length() > 0) meta.append("  ·  ");
                    meta.append(genre);
                }
                card.setTextViewText(R.id.widget_music_genre, meta.length() > 0 ? meta.toString() : "Global hit");
            } catch (Exception ignored) {
            }

            Intent fillIn = new Intent();
            card.setOnClickFillInIntent(R.id.widget_music_card_root, fillIn);
            return card;
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

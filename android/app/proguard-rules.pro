# Capacitor / WebView
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Keep JS interface classes for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Cordova plugins fallback
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# Retrofit / OkHttp si se agrega posteriormente
-dontwarn okhttp3.**
-dontwarn okio.**

# Google Play Services (face detection / biometric)
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

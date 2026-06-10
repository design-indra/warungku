import sys

manifest_path = "android/app/src/main/AndroidManifest.xml"

try:
    with open(manifest_path, "r") as f:
        content = f.read()
except FileNotFoundError:
    print("Warning: AndroidManifest.xml not found")
    sys.exit(0)

permissions = """
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-feature android:name="android.hardware.bluetooth" android:required="false" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />
"""

if "<application" in content:
    content = content.replace("<application", permissions + "\n    <application", 1)
    with open(manifest_path, "w") as f:
        f.write(content)
    print("Permissions injected successfully")
else:
    print("Warning: <application tag not found")

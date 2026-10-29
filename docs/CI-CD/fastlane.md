# Complete Flutter CI/CD with Fastlane: End-to-End Guide (Android & iOS)

A comprehensive, production-ready guide for automating Flutter mobile deployment using **Fastlane**. This guide covers the complete toolchain across **Google Play Console**, **Apple Developer Portal**, **App Store Connect**, **Fastlane Match (Git-based code signing)**, **Google Drive APK distribution**, and automated **GitHub Actions / GitLab CI** pipelines with sanitized, copy-paste-ready configuration files.

> [!TIP]
> **💡 The Master Watchmaker's Precision Jig Analogy:**
> Instead of manually clicking through hundreds of web forms in Apple and Google developer portals, Fastlane is a master watchmaker's mechanical jig. With a single terminal turn (`fastlane beta`), its gears synchronize encrypted certificates (`match`), calibrate the build spring (`flutter build`), and package the luxury timepiece directly into TestFlight and Play Store display cases (`pilot` & `supply`), executing identically on your laptop or in GitHub Actions.

---

## 1. Architecture & Pipeline Overview

Fastlane serves as the industry standard, self-hosted deployment automation engine. Rather than relying on closed-box cloud CI features, Fastlane standardizes builds, signing, testing, and distribution as reusable code (`Fastfile`) that executes identically on local developer machines and remote CI runners (GitHub Actions, GitLab CI, Bitbucket Pipelines).

```mermaid
flowchart TD
    subgraph Triggers["1. Git Triggers & Branch Strategy"]
        A["Developer Push / Pull Request"] --> B{"Target Branch"}
        B -->|"feature/* or staging"| C["Beta Lane (Dev Flavor)"]
        B -->|"main or tag v*"| D["Release Lane (Prod Flavor)"]
    end

    subgraph FastlaneCore["2. Fastlane Automation Engine"]
        E["Fastlane CLI (Ruby Bundler)"]
        F["Appfile (IDs & Credentials)"]
        G["Fastfile (Lanes & Actions)"]
        H["Matchfile (Encrypted iOS Certificates)"]
        E --> F
        E --> G
        E --> H
    end

    subgraph SecuritySigning["3. Security & Code Signing"]
        I["Google Play Service Account JSON<br>(supply / Google Cloud)"]
        J["Android Upload Keystore<br>(JKS / key.properties)"]
        K["App Store Connect API Key (.p8)<br>(No SMS/2FA verification needed)"]
        L["Fastlane Match Git Repo<br>(Encrypted with OpenSSL AES-256)"]
    end

    subgraph Execution["4. Build & Distribution Flow"]
        M["1. Flutter pub get & code generation"]
        N["2. Static analysis & Flutter tests"]
        O["3. Dynamic version bump (Remote query)"]
        P["4. Platform build (flutter build appbundle / ipa)"]
        Q["5. Sign artifacts (supply / gym)"]
        M --> N --> O --> P --> Q
    end

    subgraph StoreDelivery["5. Distribution Targets"]
        R{"Target Channel"}
        R -->|"Android Internal AAB"| S["Google Play Internal Testing"]
        R -->|"Android Dev APK"| T["Shared Google Drive / QA Direct Install"]
        R -->|"Android Production AAB"| U["Google Play Production Track"]
        R -->|"iOS Beta IPA"| V["TestFlight (Internal Testers)"]
        R -->|"iOS Release IPA"| W["App Store Connect & App Store Review"]
    end

    C --> FastlaneCore
    D --> FastlaneCore
    SecuritySigning -.-> FastlaneCore
    FastlaneCore --> Execution
    Execution --> StoreDelivery
```

---

## 2. Directory Layout & Prerequisites

In a Flutter project, Fastlane is configured separately for **Android** and **iOS** inside their respective platform directories. This guarantees zero conflict between Android Gradle plugins and iOS CocoaPods/Xcode toolchains.

### Recommended Directory Structure

```text
my_flutter_app/
├── android/
│   ├── Gemfile                     # Ruby dependencies for Android
│   ├── Gemfile.lock
│   ├── key.properties.example      # Keystore template
│   ├── app/build.gradle.kts
│   └── fastlane/
│       ├── Appfile                 # Package name & Play Console JSON key path
│       ├── Fastfile                # Android deployment lanes
│       └── metadata/android/       # Play Store changelogs & release notes
├── ios/
│   ├── Gemfile                     # Ruby dependencies for iOS
│   ├── Gemfile.lock
│   ├── Podfile
│   └── fastlane/
│       ├── Appfile                 # Bundle identifier, Apple ID, Team IDs
│       ├── Fastfile                # iOS deployment lanes
│       └── Matchfile               # Git repo config for Match code signing
├── .github/
│   └── workflows/
│       ├── fastlane_android.yml    # Android GitHub Actions pipeline
│       └── fastlane_ios.yml        # iOS GitHub Actions pipeline
└── pubspec.yaml
```

### System Prerequisites
Ensure your local machine and CI runner have the following installed:
1. **Ruby** (v3.0+ recommended)
2. **Bundler**: `gem install bundler`
3. **Flutter SDK** (matching your target project)
4. **Android SDK & Command-line Tools** (for Android builds)
5. **Xcode & Command Line Tools** (macOS only, for iOS builds)

---

## 3. Android Fastlane Setup

### Step 3.1: Service Account in Google Cloud Console
To allow Fastlane's `supply` tool to communicate with Google Play Console:

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select your project.
2. Navigate to **IAM & Admin** &rarr; **Service Accounts** &rarr; **Create Service Account**.
3. Name it `fastlane-play-publisher` and click **Create**.
4. In the **Actions** menu for the service account, select **Manage keys** &rarr; **Add Key** &rarr; **Create new key** &rarr; **JSON**.
5. Save the downloaded file as `play-service-account.json`. Keep it secure.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant GCC as Google Cloud Console
    participant GPC as Google Play Console
    participant FL as Fastlane (supply)

    Dev->>GCC: Create Service Account (fastlane-play-publisher)
    Dev->>GCC: Download JSON Private Key
    Dev->>GPC: Users & Permissions -> Invite Service Account Email
    Dev->>GPC: Grant Releases & Track Management Permissions
    Dev->>GPC: Manually upload initial AAB to register package
    Dev->>FL: Run `bundle exec fastlane internal`
    FL->>GPC: Authenticate using JSON Key & Deploy AAB to Track
```

6. Open [Google Play Console](https://play.google.com/console/) &rarr; **Users & permissions** &rarr; **Invite new user**.
7. Paste the Service Account's email address and assign permissions:
   * **Releases**: Manage testing tracks, Release to production, Manage tracks.
8. Click **Invite user** and accept.

> [!IMPORTANT]
> Google Play requires you to manually upload your very first AAB or APK via the Google Play Console web UI before the Play Developer API can upload new releases.

---

### Step 3.2: Android Upload Keystore Setup
Generate an upload keystore if you haven't created one:

```bash
keytool -genkey -v -keystore android/upload-keystore.jks \
  -alias upload-key \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storetype JKS
```

Create `android/key.properties`:
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=upload-key
storeFile=../upload-keystore.jks
```

Update `android/app/build.gradle.kts`:
```kotlin
import java.io.FileInputStream
import java.util.Properties

val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties.getProperty("keyAlias") ?: System.getenv("KEY_ALIAS")
            keyPassword = keystoreProperties.getProperty("keyPassword") ?: System.getenv("KEY_PASSWORD")
            storeFile = if (keystoreProperties.getProperty("storeFile") != null) {
                file(keystoreProperties.getProperty("storeFile"))
            } else if (System.getenv("KEYSTORE_PATH") != null) {
                file(System.getenv("KEYSTORE_PATH"))
            } else null
            storePassword = keystoreProperties.getProperty("storePassword") ?: System.getenv("STORE_PASSWORD")
        }
    }

    buildTypes {
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}
```

---

### Step 3.3: Android Gemfile
Create `android/Gemfile`:

```ruby
source "https://rubygems.org"

gem "fastlane"
```

Install via terminal:
```bash
cd android
bundle install
```

---

### Step 3.4: Android `Appfile`
Create `android/fastlane/Appfile`:

```ruby
# Path to your Google Play Service Account JSON key
json_key_file(ENV["PLAY_STORE_JSON_KEY_PATH"] || "./play-service-account.json")

# Android Package Name / Application ID
package_name(ENV["ANDROID_PACKAGE_NAME"] || "com.foundyou.app")
```

---

### Step 3.5: Android `Fastfile` (Production-Ready)
Create `android/fastlane/Fastfile`:

```ruby
default_platform(:android)

platform :android do
  desc "Runs code checks and flutter analyze"
  lane :lint do
    Dir.chdir("../..") do
      sh("flutter", "analyze")
      sh("flutter", "test")
    end
  end

  desc "Build debug or dev APK and distribute to QA"
  lane :build_dev_apk do |options|
    flavor = options[:flavor] || "dev"
    target = options[:target] || "lib/main_dev.dart"
    
    Dir.chdir("../..") do
      sh(
        "flutter", "build", "apk",
        "--flavor", flavor,
        "-t", target,
        "--debug"
      )
    end
    
    UI.success("Successfully generated Dev APK at build/app/outputs/flutter-apk/app-dev-debug.apk")
  end

  desc "Build and upload Release AAB to Google Play Internal Testing track"
  lane :internal do |options|
    flavor = options[:flavor] || "prod"
    target = options[:target] || "lib/main_prod.dart"

    # 1. Fetch latest version code from Google Play to prevent version collision
    current_version_code = google_play_track_version_codes(
      track: "internal",
      package_name: CredentialsManager::AppfileConfig.try_fetch_value(:package_name)
    ).first || 1

    next_version_code = current_version_code + 1
    UI.message("Current Play Store internal version code: #{current_version_code}")
    UI.message("Building with new version code: #{next_version_code}")

    # 2. Build App Bundle via Flutter CLI
    Dir.chdir("../..") do
      sh(
        "flutter", "build", "appbundle",
        "--flavor", flavor,
        "-t", target,
        "--release",
        "--build-number", next_version_code.to_s
      )
    end

    # 3. Publish to Google Play Internal track via supply
    aab_path = "../build/app/outputs/bundle/#{flavor}Release/app-#{flavor}-release.aab"
    
    upload_to_play_store(
      track: "internal",
      aab: aab_path,
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true,
      release_status: "completed"
    )

    UI.success("Successfully deployed build ##{next_version_code} to Google Play Internal Testing!")
  end

  desc "Promote build from Internal Testing track to Production"
  lane :promote_to_production do
    upload_to_play_store(
      track: "internal",
      track_promote_to: "production",
      skip_upload_apk: true,
      skip_upload_aab: true,
      skip_upload_metadata: false,
      skip_upload_images: true,
      skip_upload_screenshots: true,
      release_status: "completed"
    )
    UI.success("Successfully promoted Internal build to Google Play Production track!")
  end
end
```

---

## 4. iOS Fastlane Setup

Automating iOS releases requires managing code signing (certificates and provisioning profiles) and authenticating with App Store Connect without getting blocked by Apple's 2-Factor Authentication (2FA/SMS).

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant ASC as App Store Connect
    participant Git as Private Match Git Repo
    participant FL as Fastlane (match + gym + pilot)

    Dev->>ASC: Generate App Store Connect API Key (.p8)
    Dev->>Git: Create empty private Git repository for certificates
    Dev->>FL: Run `bundle exec fastlane match appstore`
    FL->>ASC: Request Distribution Certificate & App Store Profile
    FL->>FL: Encrypt certificates with MATCH_PASSWORD (AES-256)
    FL->>Git: Push encrypted certificates and profiles
    Dev->>FL: Run `bundle exec fastlane beta`
    FL->>Git: Clone & decrypt signing assets
    FL->>FL: Build Signed IPA with gym
    FL->>ASC: Upload IPA to TestFlight with pilot
```

---

### Step 4.1: Generate App Store Connect API Key (.p8)
The **App Store Connect API Key** is the recommended method to authenticate in CI/CD without 2FA issues:

1. Navigate to [App Store Connect](https://appstoreconnect.apple.com/) &rarr; **Users and Access** &rarr; **Integrations** &rarr; **App Store Connect API**.
2. Click **+** (Generate API Key).
3. **Name**: `Fastlane CI Key`
4. **Access**: Select **App Manager** or **Admin**.
5. Click **Generate**.
6. Record:
   * **Issuer ID** (UUID at top of page)
   * **Key ID** (10-character string in the table)
7. Download the `.p8` file (e.g., `AuthKey_ABCD1234EF.p8`). Save it immediately, as Apple only allows downloading it once!

---

### Step 4.2: Code Signing with Fastlane `match`
`fastlane match` creates and manages your iOS code signing identities in a centralized, encrypted private Git repository. All developers and CI runners pull the exact same certificates and provisioning profiles.

1. Create a **new, private GitHub/GitLab repository** (e.g., `github.com/your-org/ios-certificates`).
2. Generate a strong passphrase for encryption and save it as `MATCH_PASSWORD`.
3. Create `ios/Gemfile`:

```ruby
source "https://rubygems.org"

gem "fastlane"
```

Install:
```bash
cd ios
bundle install
```

4. Create `ios/fastlane/Matchfile`:

```ruby
git_url(ENV["MATCH_GIT_URL"] || "git@github.com:your-org/ios-certificates.git")
storage_mode("git")
type("appstore") # Default signing type

# App Bundle Identifiers
app_identifier(["com.foundyou.app", "com.foundyou.app.dev"])
username(ENV["APPLE_ID"] || "dev@foundyou.com")
```

---

### Step 4.3: iOS `Appfile`
Create `ios/fastlane/Appfile`:

```ruby
app_identifier(ENV["IOS_APP_IDENTIFIER"] || "com.foundyou.app")
apple_id(ENV["APPLE_ID"] || "dev@foundyou.com")
team_id(ENV["APPLE_TEAM_ID"] || "ABC123XYZ0")
itc_team_id(ENV["ITC_TEAM_ID"] || "123456789")
```

---

### Step 4.4: iOS `Fastfile` (Production-Ready)
Create `ios/fastlane/Fastfile`:

```ruby
default_platform(:ios)

platform :ios do
  before_all do
    # Load App Store Connect API Key to bypass 2FA / Apple ID authentication
    app_store_connect_api_key(
      key_id: ENV["ASC_KEY_ID"],
      issuer_id: ENV["ASC_ISSUER_ID"],
      key_content: ENV["ASC_KEY_CONTENT"], # Raw base64 or contents of .p8
      is_key_content_base64: true,
      in_house: false
    )
  end

  desc "Sync Code Signing Certificates and Profiles"
  lane :sync_certificates do |options|
    type = options[:type] || "appstore"
    readonly = is_ci ? true : false

    match(
      type: type,
      readonly: readonly,
      git_url: ENV["MATCH_GIT_URL"]
    )
  end

  desc "Build and upload iOS Release IPA to TestFlight"
  lane :beta do |options|
    flavor = options[:flavor] || "prod"
    target = options[:target] || "lib/main_prod.dart"
    bundle_id = CredentialsManager::AppfileConfig.try_fetch_value(:app_identifier)

    # 1. Synchronize signing credentials
    sync_certificates(type: "appstore")

    # 2. Get latest build number from TestFlight to avoid version collision
    latest_build = latest_testflight_build_number(
      app_identifier: bundle_id
    ) || 0
    new_build_number = latest_build + 1
    UI.message("Current TestFlight build: #{latest_build}. Next build: #{new_build_number}")

    # 3. Build IPA with Flutter CLI
    Dir.chdir("../..") do
      sh(
        "flutter", "build", "ipa",
        "--flavor", flavor,
        "-t", target,
        "--release",
        "--build-number", new_build_number.to_s,
        "--export-options-plist", "ios/ExportOptions.plist"
      )
    end

    # 4. Upload IPA to TestFlight via pilot
    ipa_path = "../build/ios/ipa/found_you.ipa"
    
    upload_to_testflight(
      ipa: ipa_path,
      skip_waiting_for_build_processing: true,
      distribute_external: false,
      changelog: "Automated CI build ##{new_build_number}"
    )

    UI.success("Successfully uploaded iOS build ##{new_build_number} to TestFlight!")
  end

  desc "Submit build to App Store for Public Review"
  lane :release do
    upload_to_app_store(
      force: true,
      skip_metadata: false,
      skip_screenshots: true,
      reject_build_if_possible: true,
      submit_for_review: false
    )
    UI.success("Uploaded to App Store Connect, ready for submission!")
  end
end
```

Create `ios/ExportOptions.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>signingStyle</key>
    <string>manual</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

---

## 5. Google Drive Automated Dev APK Distribution

For QA testers who need to install test builds without waiting for Google Play Internal Review, Fastlane can trigger an automated Python upload script that uploads the APK to a shared Google Drive folder and posts a direct download link.

```mermaid
sequenceDiagram
    autonumber
    participant FL as Fastlane
    participant Py as distribute_drive.py
    participant GDrive as Google Drive API v3
    participant Slack as Team Slack Channel

    FL->>FL: flutter build apk --debug --flavor dev
    FL->>Py: Execute python3 distribute_drive.py
    Py->>GDrive: Authenticate with Service Account / OAuth
    Py->>GDrive: Upload app-dev-debug.apk into Target Folder ID
    GDrive-->>Py: Return Web View Link & Direct Download URL
    Py->>Slack: Post release notification with APK direct download link
```

### Python Script: `scripts/distribute_drive.py`

```python
#!/usr/bin/env python3
import os
import sys
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def upload_apk(apk_path, folder_id, service_account_json_str):
    if not os.path.exists(apk_path):
        print(f"Error: APK file not found at {apk_path}")
        sys.exit(1)

    # Load credentials from environment variable
    service_account_info = json.loads(service_account_json_str)
    creds = service_account.Credentials.from_service_account_info(
        service_account_info, scopes=SCOPES
    )

    drive_service = build('drive', 'v3', credentials=creds)

    file_name = os.path.basename(apk_path)
    file_metadata = {
        'name': file_name,
        'parents': [folder_id]
    }

    media = MediaFileUpload(
        apk_path,
        mimetype='application/vnd.android.package-archive',
        resumable=True
    )

    print(f"Uploading {file_name} to Google Drive folder: {folder_id}...")
    file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id, webViewLink, webContentLink'
    ).execute()

    print(f"Upload Complete!")
    print(f"File ID: {file.get('id')}")
    print(f"Download Link: {file.get('webViewLink')}")
    return file.get('webViewLink')

if __name__ == '__main__':
    apk = sys.argv[1] if len(sys.argv) > 1 else "build/app/outputs/flutter-apk/app-dev-debug.apk"
    folder = os.environ.get('GDRIVE_QA_FOLDER_ID')
    sa_json = os.environ.get('GDRIVE_SERVICE_ACCOUNT_JSON')

    if not folder or not sa_json:
        print("Missing GDRIVE_QA_FOLDER_ID or GDRIVE_SERVICE_ACCOUNT_JSON environment variable")
        sys.exit(1)

    upload_apk(apk, folder, sa_json)
```

In `android/fastlane/Fastfile`, integrate with a single call:
```ruby
lane :distribute_drive do
  build_dev_apk(flavor: "dev")
  sh("python3", "../../scripts/distribute_drive.py", "../build/app/outputs/flutter-apk/app-dev-debug.apk")
end
```

---

## 6. Complete GitHub Actions CI/CD Pipeline

Here is the complete, copy-paste-ready GitHub Actions workflow that executes the Fastlane lanes inside automated runners.

### `.github/workflows/fastlane_deploy.yml`

```yaml
name: Flutter Fastlane CI/CD

on:
  push:
    branches:
      - staging
      - main
    tags:
      - 'v*'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # -------------------------------------------------------------
  # ANDROID RELEASE WORKFLOW (Ubuntu Runner)
  # -------------------------------------------------------------
  android_release:
    name: Build & Deploy Android (Fastlane)
    runs-on: ubuntu-latest
    timeout-minutes: 45

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
          working-directory: android

      - name: Set up Flutter SDK
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.x'
          channel: 'stable'
          cache: true

      - name: Restore Keystore & Secrets
        env:
          KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
          PLAY_JSON_BASE64: ${{ secrets.PLAY_STORE_JSON_KEY_BASE64 }}
          KEY_PROPERTIES: ${{ secrets.ANDROID_KEY_PROPERTIES }}
        run: |
          echo "$KEYSTORE_BASE64" | base64 --decode > android/upload-keystore.jks
          echo "$PLAY_JSON_BASE64" | base64 --decode > android/fastlane/play-service-account.json
          echo "$KEY_PROPERTIES" > android/key.properties

      - name: Install Flutter Dependencies
        run: |
          flutter pub get

      - name: Run Fastlane Android Lane
        working-directory: android
        env:
          ANDROID_PACKAGE_NAME: "com.foundyou.app"
          PLAY_STORE_JSON_KEY_PATH: "./fastlane/play-service-account.json"
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/staging" ]]; then
            bundle exec fastlane internal flavor:dev target:lib/main_dev.dart
          else
            bundle exec fastlane internal flavor:prod target:lib/main_prod.dart
          fi

  # -------------------------------------------------------------
  # IOS RELEASE WORKFLOW (macOS Runner)
  # -------------------------------------------------------------
  ios_release:
    name: Build & Deploy iOS (Fastlane)
    runs-on: macos-14
    timeout-minutes: 60

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
          working-directory: ios

      - name: Set up Flutter SDK
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.x'
          channel: 'stable'
          cache: true

      - name: Setup SSH Key for Fastlane Match
        env:
          MATCH_SSH_KEY: ${{ secrets.MATCH_GIT_PRIVATE_SSH_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$MATCH_SSH_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan github.com >> ~/.ssh/known_hosts

      - name: Install Flutter & CocoaPods Dependencies
        run: |
          flutter pub get
          cd ios && pod install --repo-update

      - name: Run Fastlane iOS Lane
        working-directory: ios
        env:
          ASC_KEY_ID: ${{ secrets.ASC_KEY_ID }}
          ASC_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
          ASC_KEY_CONTENT: ${{ secrets.ASC_KEY_CONTENT_BASE64 }}
          MATCH_GIT_URL: ${{ secrets.MATCH_GIT_URL }}
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          IOS_APP_IDENTIFIER: "com.foundyou.app"
        run: |
          bundle exec fastlane beta flavor:prod target:lib/main_prod.dart
```

---

## 7. Secrets & Environment Variables Matrix

Store the following secrets securely in your CI/CD settings (e.g. GitHub Repository Secrets):

| Secret / Variable Name | Platform | Description | Example / Format |
|---|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | Android | Base64-encoded `upload-keystore.jks` file | `base64 -i upload-keystore.jks` |
| `PLAY_STORE_JSON_KEY_BASE64` | Android | Base64-encoded Google Cloud Service Account JSON | `base64 -i service-account.json` |
| `ANDROID_KEY_PROPERTIES` | Android | Contents of `key.properties` for Gradle signing | `storePassword=...` |
| `ASC_KEY_ID` | iOS | App Store Connect API Key ID (10 alphanumeric chars) | `2X9R4ABCD2` |
| `ASC_ISSUER_ID` | iOS | App Store Connect API Issuer ID (UUID) | `57246542-96fe-1a63-e053-0824d011072a` |
| `ASC_KEY_CONTENT_BASE64` | iOS | Base64-encoded content of `AuthKey_XXXXX.p8` | `base64 -i AuthKey_2X9R4ABCD2.p8` |
| `MATCH_GIT_URL` | iOS | Git URL for the private Match certificates repository | `git@github.com:org/ios-certs.git` |
| `MATCH_PASSWORD` | iOS | Passphrase used to encrypt/decrypt certificates in Git | Strong alphanumeric passkey |
| `MATCH_GIT_PRIVATE_SSH_KEY`| iOS | Private SSH Deploy Key with read access to Match repo | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `GDRIVE_QA_FOLDER_ID` | QA | Target Google Drive folder ID for dev APK distribution | `1BxiMVs0XRA5nFMdKvBHKr...` |
| `GDRIVE_SERVICE_ACCOUNT_JSON`| QA | Full raw JSON string of Drive API Service Account | `{"type": "service_account", ...}` |

---

## 8. Verification & Debugging Checklist

Before running Fastlane on CI, verify each step locally:

### Local Android Check
```bash
cd android
# 1. Test lint and tests
bundle exec fastlane lint

# 2. Test Play Store credentials and fetch current version
bundle exec fastlane run google_play_track_version_codes track:internal package_name:com.foundyou.app

# 3. Test build dev APK
bundle exec fastlane build_dev_apk
```

### Local iOS Check
```bash
cd ios
# 1. Verify Match signing download without modifying certificates
bundle exec fastlane match appstore --readonly

# 2. Verify App Store Connect API Key connectivity
bundle exec fastlane run latest_testflight_build_number app_identifier:com.foundyou.app

# 3. Dry-run IPA generation
bundle exec fastlane beta
```

### Common Pitfalls & Solutions

1. **`Google Play Developer API: Changes cannot be sent for review until an initial artifact is uploaded.`**
   * *Cause:* The app was never published or manually uploaded via the web UI.
   * *Fix:* Manually upload your first AAB through the Google Play Console web dashboard once. All subsequent uploads can be automated with Fastlane.

2. **`Match could not clone git repository (Permission Denied).`**
   * *Cause:* The CI runner does not have SSH authentication to the private Match repository.
   * *Fix:* Add an SSH Deploy Key with read access to the certificates repository and load it in your CI pipeline using `ssh-add` or `actions/setup-ssh`.

3. **`Gem::LoadError: Specified 'bundle' gem version does not match Gemfile.lock.`**
   * *Cause:* Bundler version mismatch between local machine and CI runner.
   * *Fix:* Run `bundle update --bundler` locally, commit `Gemfile.lock`, and ensure `bundler-cache: true` is set on the CI runner.

4. **`App Store Connect API Key Invalid or Unauthorized.`**
   * *Cause:* Key was created with insufficient permissions or wrong Issuer ID.
   * *Fix:* Ensure the Key has **App Manager** or **Admin** access in App Store Connect, and verify the `ASC_ISSUER_ID` matches the UUID at the top of the API Keys page.

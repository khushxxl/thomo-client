import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Pressable, ActivityIndicator, Linking } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { TextWrapper } from "@/components/text-wrapper";
import {
  fetchFinexerConnectLink,
  fetchStatus,
  getErrorMessage,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export type ConnectBankSheetRef = {
  open: () => void;
  close: () => void;
};

type Props = {
  onConnected: () => void;
  /** When false, the sheet cannot be swiped down, backdrop-tapped, or hardware-closed. */
  dismissible?: boolean;
};

export const ConnectBankSheet = forwardRef<ConnectBankSheetRef, Props>(
  ({ onConnected, dismissible = true }, ref) => {
    const { signOut } = useAuth();
    const sheetRef = useRef<BottomSheet>(null);
    const [connecting, setConnecting] = useState(false);
    const [browserOpened, setBrowserOpened] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const snapPoints = useMemo(() => ["50%"], []);

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.expand(),
      close: () => sheetRef.current?.close(),
    }));

    const handleOpenBrowser = useCallback(async () => {
      setConnecting(true);
      setError(null);

      try {
        const { consent_url } = await fetchFinexerConnectLink();

        const supported = await Linking.canOpenURL(consent_url);
        if (!supported) {
          setError("Can't open the browser on this device.");
          return;
        }
        await Linking.openURL(consent_url);
        setBrowserOpened(true);
      } catch (err) {
        console.error("Finexer connect error:", err);
        setError(getErrorMessage(err, "Could not open browser. Please try again."));
      } finally {
        setConnecting(false);
      }
    }, []);

    const [verifying, setVerifying] = useState(false);

    const handleConfirmConnected = useCallback(async () => {
      setVerifying(true);
      setError(null);

      try {
        const { connected } = await fetchStatus();
        if (connected) {
          sheetRef.current?.close();
          setBrowserOpened(false);
          onConnected();
        } else {
          setError(
            "We couldn't detect a connected bank yet. Please complete the connection in your browser first.",
          );
        }
      } catch (err) {
        setError(getErrorMessage(err, "Could not verify connection. Please try again."));
      } finally {
        setVerifying(false);
      }
    }, [onConnected]);

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={dismissible ? 0.5 : 0.7}
          pressBehavior={dismissible ? "close" : "none"}
        />
      ),
      [dismissible],
    );

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={dismissible}
        enableHandlePanningGesture={dismissible}
        enableContentPanningGesture={dismissible}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: "#FFFFFF" }}
        handleIndicatorStyle={{
          backgroundColor: dismissible ? "#D4D4D4" : "transparent",
        }}
      >
        <BottomSheetView
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 40,
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <TextWrapper
              weight="medium"
              style={{
                fontSize: 22,
                color: "#1A1A1A",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Connect your bank
            </TextWrapper>

            <TextWrapper
              weight="regular"
              style={{
                fontSize: 14,
                color: "#888",
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Securely link your business account.{"\n"}Read only, we never move
              your money.
            </TextWrapper>
          </View>

          {/* Trust bullets */}
          <View style={{ gap: 10, marginVertical: 16 }}>
            <TrustRow label="Read only access, we can't move money" />
            <TrustRow label="FCA regulated" />
            <TrustRow label="Takes less than 60 seconds" />
          </View>

          {/* Error */}
          {error && (
            <TextWrapper
              weight="regular"
              style={{
                fontSize: 13,
                color: "#DC2626",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              {error}
            </TextWrapper>
          )}

          {/* CTA */}
          <View>
            {browserOpened ? (
              <>
                <Pressable
                  onPress={handleConfirmConnected}
                  disabled={verifying}
                  style={{
                    backgroundColor: "#1A1A1A",
                    borderRadius: 14,
                    paddingVertical: 18,
                    alignItems: "center",
                    marginBottom: 10,
                    opacity: verifying ? 0.7 : 1,
                  }}
                >
                  {verifying ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <TextWrapper
                      weight="medium"
                      style={{ fontSize: 16, color: "#FFFFFF" }}
                    >
                      I connected my bank
                    </TextWrapper>
                  )}
                </Pressable>
                <Pressable
                  onPress={handleOpenBrowser}
                  disabled={connecting}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#E5E5E5",
                  }}
                >
                  {connecting ? (
                    <ActivityIndicator color="#1A1A1A" />
                  ) : (
                    <TextWrapper
                      weight="regular"
                      style={{ fontSize: 14, color: "#666" }}
                    >
                      Open browser again
                    </TextWrapper>
                  )}
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={handleOpenBrowser}
                disabled={connecting}
                style={{
                  backgroundColor: "#1A1A1A",
                  borderRadius: 14,
                  paddingVertical: 18,
                  alignItems: "center",
                  opacity: connecting ? 0.7 : 1,
                  marginTop: 20,
                }}
              >
                {connecting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <TextWrapper
                    weight="medium"
                    style={{ fontSize: 16, color: "#FFFFFF" }}
                  >
                    Connect your bank
                  </TextWrapper>
                )}
              </Pressable>
            )}

            <TextWrapper
              weight="regular"
              style={{
                fontSize: 11,
                color: "#AAA",
                textAlign: "center",
                marginTop: 12,
              }}
            >
              Powered by Finexer, 256-bit encryption
            </TextWrapper>

            <Pressable
              onPress={signOut}
              style={{ marginTop: 14, alignItems: "center" }}
            >
              <TextWrapper
                weight="regular"
                style={{ fontSize: 13, color: "#BBB" }}
              >
                Log out
              </TextWrapper>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

ConnectBankSheet.displayName = "ConnectBankSheet";

function TrustRow({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: "#1A1A1A",
        }}
      />
      <TextWrapper
        weight="regular"
        style={{ fontSize: 14, color: "#1A1A1A", flex: 1 }}
      >
        {label}
      </TextWrapper>
    </View>
  );
}

// Account number: 13710040
// Sort code: 04-00-04

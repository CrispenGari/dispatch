import { View, Text, ScrollView } from "react-native";
import React from "react";
import { COLORS, FONTS } from "../../../constants";
import { AppNavProps } from "../../../params";
import AppStackBackButton from "../../../components/AppStackBackButton/AppStackBackButton";
import { styles } from "../../../styles";
import { usePlatform } from "../../../hooks";

const PrivacyPolicy: React.FunctionComponent<
  AppNavProps<"AppPrivacyPolicy">
> = ({ navigation }) => {
  const { os } = usePlatform();
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Privacy Policy",
      headerShown: true,
      headerTitleStyle: {
        fontFamily: FONTS.regularBold,
      },
      headerLeft: () => (
        <AppStackBackButton
          label={os === "ios" ? "Back" : ""}
          onPress={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation]);
  return (
    <ScrollView
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 100,
        paddingHorizontal: 10,
        paddingTop: 10,
      }}
      style={{ backgroundColor: COLORS.main, flex: 1 }}
    >
      <Text style={[styles.h1, { marginTop: 15, fontSize: 20 }]}>
        Privacy Policy
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        Dispatch Inc. built the Dispatch app as a Freemium app. This SERVICE is
        provided by Dispatch Inc. at no cost and is intended for use as is.
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        This page is used to inform visitors regarding our policies with the
        collection, use, and disclosure of Personal Information if anyone
        decided to use our Service.
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        If you choose to use our Service, then you agree to the collection and
        use of information in relation to this policy. The Personal Information
        that we collect is used for providing and improving the Service. We will
        not use or share your information with anyone except as described in
        this Privacy Policy.
      </Text>

      <Text style={[styles.p, { marginTop: 10 }]}>
        The terms used in this Privacy Policy have the same meanings as in our
        Terms and Conditions, which are accessible at Dispatch unless otherwise
        defined in this Privacy Policy.
      </Text>

      <Text style={[styles.h1, { marginTop: 15, fontSize: 20 }]}>
        Information Collection and Use
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        For a better experience, while using our Service, we may require you to
        provide us with certain personally identifiable information. The
        information that we request will be retained by us and used as described
        in this privacy policy.
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        The app does use third-party services that may collect information used
        to identify you.
      </Text>
      <Text style={[styles.h1, { marginTop: 15, fontSize: 20 }]}>Log Data</Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        We want to inform you that whenever you use our Service, in a case of an
        error in the app we collect data and information (through third-party
        products) on your phone called Log Data. This Log Data may include
        information such as your device Internet Protocol (“IP”) address, device
        name, operating system version, the configuration of the app when
        utilizing our Service, the time and date of your use of the Service, and
        other statistics.
      </Text>
      <Text style={[styles.h1, { marginTop: 15, fontSize: 20 }]}>Cookies</Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        Cookies are files with a small amount of data that are commonly used as
        anonymous unique identifiers. These are sent to your browser from the
        websites that you visit and are stored on your device's internal memory.
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        This Service does not use these “cookies” explicitly. However, the app
        may use third-party code and libraries that use “cookies” to collect
        information and improve their services. You have the option to either
        accept or refuse these cookies and know when a cookie is being sent to
        your device. If you choose to refuse our cookies, you may not be able to
        use some portions of this Service.
      </Text>
      <Text style={[styles.h1, { marginTop: 15, fontSize: 20 }]}>Security</Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        We value your trust in providing us your Personal Information, thus we
        are striving to use commercially acceptable means of protecting it. But
        remember that no method of transmission over the internet, or method of
        electronic storage is 100% secure and reliable, and we cannot guarantee
        its absolute security.
      </Text>

      <Text style={[styles.h1, { marginTop: 15, fontSize: 20 }]}>
        Links to Other Sites
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        This Service may contain links to other sites. If you click on a
        third-party link, you will be directed to that site. Note that these
        external sites are not operated by us. Therefore, we strongly advise you
        to review the Privacy Policy of these websites. We have no control over
        and assume no responsibility for the content, privacy policies, or
        practices of any third-party sites or services.
      </Text>
      <Text style={[styles.h1, { marginTop: 15, fontSize: 20 }]}>
        Children’s Privacy
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        These Services do not address anyone under the age of 13. We do not
        knowingly collect personally identifiable information from children
        under 13 years of age. In the case we discover that a child under 13 has
        provided us with personal information, we immediately delete this from
        our servers. If you are a parent or guardian and you are aware that your
        child has provided us with personal information, please contact us so
        that we will be able to do the necessary actions.
      </Text>

      <Text style={[styles.h1, { marginTop: 15, fontSize: 20 }]}>
        Changes to This Privacy Policy
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        We may update our Privacy Policy from time to time. Thus, you are
        advised to review this page periodically for any changes. We will notify
        you of any changes by posting the new Privacy Policy on this page.
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        This policy is effective as of 2023-07-01
      </Text>

      <Text style={[styles.h1, { marginTop: 15, fontSize: 20 }]}>
        Contact Us.
      </Text>
      <Text style={[styles.p, { marginTop: 10 }]}>
        If you have any questions or suggestions about our Privacy Policy, do
        not hesitate to contact us at crispengari@gmail.com.
      </Text>
    </ScrollView>
  );
};

export default PrivacyPolicy;

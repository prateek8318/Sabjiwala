import { StyleSheet } from "react-native";

import { Colors,Typography } from "../../constant";
import { heightPercentageToDP as hp } from "../../constant/dimentions";

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    buttonView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hp(5)
    },
    radioButton: {
        width: 30,
        height: 30
    },
    title: {
        color: Colors.PRIMARY[400],
        ...Typography.BodyRegular14,
        left: hp(2),
    },

});

export default styles;
